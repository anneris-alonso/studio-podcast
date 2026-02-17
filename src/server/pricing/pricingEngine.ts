import { Package, Service, PackageUnit, ServiceUnit } from "@prisma/client";

/**
 * Pricing Engine - Step 5.5
 * Handles computations in minor units (AED fils)
 */

export interface PricingResult {
  unitPriceMinor: number;
  totalPriceMinor: number;
  quantity: number;
}

export function computePackagePrice(pkg: any, quantity: number): PricingResult {
  const pricePerUnit = pkg.pricePerUnitMinor || 0;
  let totalPrice = 0;

  switch (pkg.unit as PackageUnit) {
    case PackageUnit.HOUR:
    case PackageUnit.DAY:
      totalPrice = pricePerUnit * quantity;
      break;
    case PackageUnit.FIXED_MINUTES:
      // For fixed minutes, quantity should ideally be 1
      totalPrice = pricePerUnit; 
      quantity = 1;
      break;
    default:
      totalPrice = pricePerUnit;
      quantity = 1;
  }

  return {
    unitPriceMinor: pricePerUnit,
    totalPriceMinor: totalPrice,
    quantity,
  };
}

export function computeServicePrice(
  service: any, 
  quantity: number, 
  pkgInfo: { unit: PackageUnit; quantity: number; durationMinutes: number }
): PricingResult {
  const pricePerUnit = service.priceMinor || 0;
  let totalPrice = 0;

  // Derive duration based on package unit + quantity
  let durationHours = 0;
  let durationDays = 0;

  if (pkgInfo.unit === PackageUnit.HOUR) {
    durationHours = pkgInfo.quantity;
    durationDays = Math.ceil(durationHours / 24);
  } else if (pkgInfo.unit === PackageUnit.DAY) {
    durationDays = pkgInfo.quantity;
    durationHours = durationDays * 24;
  } else {
    // FIXED_MINUTES
    durationHours = pkgInfo.durationMinutes / 60;
    durationDays = Math.ceil(durationHours / 24);
  }

  switch (service.unit as ServiceUnit) {
    case ServiceUnit.PER_BOOKING:
    case ServiceUnit.FIXED:
      totalPrice = pricePerUnit * quantity;
      break;
    case ServiceUnit.PER_HOUR:
      totalPrice = (durationHours * pricePerUnit) * quantity;
      break;
    case ServiceUnit.PER_DAY:
      totalPrice = (durationDays * pricePerUnit) * quantity;
      break;
    default:
      totalPrice = pricePerUnit * quantity;
  }

  return {
    unitPriceMinor: pricePerUnit,
    totalPriceMinor: totalPrice,
    quantity,
  };
}

/**
 * Computes the endTime for a booking based on start time, package unit and qty
 */
export function computeEndTime(startTime: Date, unit: PackageUnit, quantity: number, fixedMinutes: number = 60): Date {
  const end = new Date(startTime);
  switch (unit) {
    case PackageUnit.HOUR:
      end.setHours(end.getHours() + quantity);
      break;
    case PackageUnit.DAY:
      end.setDate(end.getDate() + quantity);
      break;
    case PackageUnit.FIXED_MINUTES:
    default:
      end.setMinutes(end.getMinutes() + fixedMinutes);
  }
  return end;
}
