'use server';

import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guards';
import { ServiceSchema } from '@/lib/validations/admin-catalog';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

async function logAudit(action: string, entity: string, entityId: string, actor: any, metadata?: any) {
  const head = await headers();
  const requestId = head.get('x-request-id');
  const ip = head.get('x-forwarded-for')?.split(',')[0] || null;
  const userAgent = head.get('user-agent');

  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        actorUserId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        requestId,
        ip,
        userAgent,
        metadata: metadata || undefined,
      }
    });
  } catch (error: any) {
    logger.error("AuditLog failure", { action, requestId, error: error.message });
  }
}

export async function createService(data: z.infer<typeof ServiceSchema>) {
  const admin = await requireAdmin();
  const validated = ServiceSchema.parse(data);

  if (await prisma.service.findUnique({ where: { slug: validated.slug } })) {
    throw new Error("Slug already exists");
  }

  const svc = await prisma.service.create({
    data: {
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      
      category: validated.category,
      unit: validated.unit,
      priceMinor: validated.priceMinor,
      minQuantity: validated.minQuantity,
      maxQuantity: validated.maxQuantity,
      stepQuantity: validated.stepQuantity,
      isActive: validated.isActive,

      // Legacy
      price: validated.priceMinor / 100,
      active: validated.isActive,
    }
  });

  await logAudit('ADMIN_SERVICE_CREATE', 'Service', svc.id, admin, { slug: svc.slug });
  revalidatePath('/admin/services');
  return { success: true, svc };
}

export async function updateService(id: string, data: Partial<z.infer<typeof ServiceSchema>>) {
  const admin = await requireAdmin();
  await prisma.service.findUniqueOrThrow({ where: { id } });

  const price = data.priceMinor !== undefined ? data.priceMinor / 100 : undefined;
  const active = data.isActive;

  const svc = await prisma.service.update({
    where: { id },
    data: {
      ...data,
      ...(price !== undefined && { price }),
      ...(active !== undefined && { active }),
    }
  });

  await logAudit('ADMIN_SERVICE_UPDATE', 'Service', svc.id, admin);
  revalidatePath('/admin/services');
  return { success: true, svc };
}

export async function deactivateService(id: string) {
  const admin = await requireAdmin();
  await prisma.service.update({
    where: { id },
    data: { isActive: false, active: false }
  });
  await logAudit('ADMIN_SERVICE_DEACTIVATE', 'Service', id, admin);
  revalidatePath('/admin/services');
  return { success: true };
}
