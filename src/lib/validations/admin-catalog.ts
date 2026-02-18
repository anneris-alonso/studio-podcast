import { z } from 'zod';
import { PackageUnit, ServiceUnit } from '@prisma/client';

// Regex: Lowercase alphanumeric, hyphens allowed in middle, no double hyphens
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const BaseEntitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().regex(SLUG_REGEX, "Invalid slug format (e.g., 'my-package-name')"),
  description: z.string().min(1, "Description is required"),
  isActive: z.boolean().default(true),
});

// --- Studio Schemas ---

export const StudioSchema = BaseEntitySchema.extend({
  capacity: z.number().int().min(1),
  equipmentSummary: z.string(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  // galleryImageUrls is handled as string array in UI but logic might vary
});

// --- Package Schemas ---

export const PackageSchema = BaseEntitySchema.extend({
  studioRoomId: z.string().nullable().optional(), // Null for global
  unit: z.nativeEnum(PackageUnit),
  pricePerUnitMinor: z.number().int().min(0, "Price must be positive integers (fils)"),
  durationMinutes: z.number().int().min(0),
  minQuantity: z.number().int().min(1),
  maxQuantity: z.number().int().min(1),
  stepQuantity: z.number().int().min(1),
}).superRefine((data, ctx) => {
  // Rule 1: Max >= Min
  if (data.maxQuantity < data.minQuantity) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Max quantity must be greater than or equal to min quantity",
      path: ["maxQuantity"],
    });
  }

  // Rule 2: Fixed Minutes Rules (1, 1, 1)
  if (data.unit === PackageUnit.FIXED_MINUTES) {
    if (data.minQuantity !== 1 || data.maxQuantity !== 1 || data.stepQuantity !== 1) {
       ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fixed Minutes packages must have quantities fixed to 1",
        path: ["unit"],
      });
    }
    if (data.durationMinutes <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duration is required for Fixed Minutes packages",
        path: ["durationMinutes"],
      });
    }
  }
});

// --- Service Schemas ---

export const ServiceSchema = BaseEntitySchema.extend({
  category: z.enum(['RECORDING', 'EDITING', 'EXTRA']),
  unit: z.nativeEnum(ServiceUnit),
  priceMinor: z.number().int().min(0, "Price must be positive integers (fils)"),
  minQuantity: z.number().int().min(1),
  maxQuantity: z.number().int().min(1),
  stepQuantity: z.number().int().min(1),
}).refine((data) => data.maxQuantity >= data.minQuantity, {
  message: "Max quantity must be greater than or equal to min quantity",
  path: ["maxQuantity"],
});

export type StudioFormData = z.infer<typeof StudioSchema>;
export type PackageFormData = z.infer<typeof PackageSchema>;
export type ServiceFormData = z.infer<typeof ServiceSchema>;
