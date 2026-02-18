'use server';

import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guards';
import { StudioSchema } from '@/lib/validations/admin-catalog';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

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
  } catch (error) {
    console.error("AuditLog failure:", error);
  }
}

export async function createStudioRoom(data: z.infer<typeof StudioSchema>) {
  const admin = await requireAdmin();
  const validated = StudioSchema.parse(data);

  const existing = await prisma.studioRoom.findUnique({ where: { slug: validated.slug } });
  if (existing) {
    throw new Error("Slug already exists");
  }

  const studio = await prisma.studioRoom.create({
    data: {
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      capacity: validated.capacity,
      equipmentSummary: validated.equipmentSummary,
      coverImageUrl: validated.coverImageUrl || null,
      isActive: validated.isActive,
    }
  });

  await logAudit('ADMIN_STUDIO_CREATE', 'StudioRoom', studio.id, admin, { slug: studio.slug });
  revalidatePath('/admin/studios');
  return { success: true, studio };
}

export async function updateStudioRoom(id: string, data: Partial<z.infer<typeof StudioSchema>>) {
  const admin = await requireAdmin();
  const existing = await prisma.studioRoom.findUniqueOrThrow({ where: { id } });

  const studio = await prisma.studioRoom.update({
    where: { id },
    data: { ...data }
  });

  await logAudit('ADMIN_STUDIO_UPDATE', 'StudioRoom', studio.id, admin, { changed: Object.keys(data) });
  revalidatePath('/admin/studios');
  return { success: true, studio };
}

export async function deactivateStudioRoom(id: string) {
  const admin = await requireAdmin();

  await prisma.studioRoom.update({
    where: { id },
    data: { isActive: false }
  });

  await logAudit('ADMIN_STUDIO_DEACTIVATE', 'StudioRoom', id, admin);
  revalidatePath('/admin/studios');
  return { success: true };
}
