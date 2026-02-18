'use server';

import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guards';
import { PackageSchema } from '@/lib/validations/admin-catalog';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { PackageUnit } from '@prisma/client';

async function logAudit(action: string, entity: string, entityId: string, actor: any, metadata?: any) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        actorUserId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      }
    });
  } catch (error) { console.error(error); }
}

export async function createPackage(data: z.infer<typeof PackageSchema>) {
  const admin = await requireAdmin();
  const validated = PackageSchema.parse(data);

  if (await prisma.package.findUnique({ where: { slug: validated.slug } })) {
    throw new Error("Slug already exists");
  }

  // Ensure legacy fields are filled reasonably
  const pkg = await prisma.package.create({
    data: {
      // Basic
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      studioRoomId: validated.studioRoomId || null,
      isActive: validated.isActive,
      // Flexible
      unit: validated.unit,
      pricePerUnitMinor: validated.pricePerUnitMinor,
      durationMinutes: validated.durationMinutes,
      minQuantity: validated.minQuantity,
      maxQuantity: validated.maxQuantity,
      stepQuantity: validated.stepQuantity,
      // Legacy required fields mapping
      // If pricePerUnitMinor is 1000 fils (10 AED), legacy price = 10.00
      price: validated.pricePerUnitMinor / 100,
      active: validated.isActive,
    }
  });

  await logAudit('ADMIN_PACKAGE_CREATE', 'Package', pkg.id, admin, { slug: pkg.slug });
  revalidatePath('/admin/packages');
  return { success: true, pkg };
}

export async function updatePackage(id: string, data: Partial<z.infer<typeof PackageSchema>>) {
  const admin = await requireAdmin();
  const existing = await prisma.package.findUniqueOrThrow({ where: { id } });

  // If unit is changing, re-validate rules logic here or rely on UI to send full correct data
  // Since schemas use superRefine, checking partials is tricky. 
  // We assume the UI sends coherent updates.

  // Sync legacy fields if modern fields change
  const price = data.pricePerUnitMinor !== undefined ? data.pricePerUnitMinor / 100 : undefined;
  const active = data.isActive;

  const pkg = await prisma.package.update({
    where: { id },
    data: { 
      ...data,
      ...(price !== undefined && { price }),
      ...(active !== undefined && { active }),
    }
  });

  await logAudit('ADMIN_PACKAGE_UPDATE', 'Package', pkg.id, admin);
  revalidatePath('/admin/packages');
  return { success: true, pkg };
}

export async function deactivatePackage(id: string) {
  const admin = await requireAdmin();
  await prisma.package.update({
    where: { id },
    data: { isActive: false, active: false }
  });
  await logAudit('ADMIN_PACKAGE_DEACTIVATE', 'Package', id, admin);
  revalidatePath('/admin/packages');
  return { success: true };
}
