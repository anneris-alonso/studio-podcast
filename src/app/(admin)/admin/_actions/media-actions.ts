'use server';

import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guards';
import { StudioSchema } from '@/lib/validations/admin-catalog';
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
      media: {
        create: validated.media.map(m => ({
          url: m.url,
          type: m.type as any,
          sortOrder: m.sortOrder
        }))
      }
    }
  });

  await logAudit('ADMIN_STUDIO_CREATE', 'StudioRoom', studio.id, admin, { slug: studio.slug });
  revalidatePath('/admin/studios');
  return { success: true };
}

export async function updateStudioRoom(id: string, data: Partial<z.infer<typeof StudioSchema>>) {
  const admin = await requireAdmin();
  const validated = StudioSchema.partial().parse(data);

  const studio = await prisma.$transaction(async (tx) => {
    const updated = await tx.studioRoom.update({
      where: { id },
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        capacity: validated.capacity,
        equipmentSummary: validated.equipmentSummary,
        coverImageUrl: validated.coverImageUrl,
        isActive: validated.isActive,
      }
    });

    if (validated.media) {
      // Simple strategy: delete and recreate media
      await tx.studioMedia.deleteMany({ where: { studioRoomId: id } });
      await tx.studioMedia.createMany({
        data: validated.media.map(m => ({
          studioRoomId: id,
          url: m.url,
          type: m.type as any,
          sortOrder: m.sortOrder
        }))
      });
    }

    return updated;
  });

  await logAudit('ADMIN_STUDIO_UPDATE', 'StudioRoom', id, admin, { changed: Object.keys(data) });
  revalidatePath('/admin/studios');
  return { success: true };
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
