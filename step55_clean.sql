-- CreateEnum
CREATE TYPE "PackageUnit" AS ENUM ('HOUR', 'DAY', 'FIXED_MINUTES');
-- CreateEnum
CREATE TYPE "ServiceUnit" AS ENUM ('PER_BOOKING', 'PER_HOUR', 'PER_DAY', 'FIXED');
-- AlterTable
ALTER TABLE "booking_line_items"
ADD COLUMN "total_price_minor_snapshot" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "unit_price_minor_snapshot" INTEGER NOT NULL DEFAULT 0;
-- AlterTable
ALTER TABLE "bookings"
ADD COLUMN "total_price_minor_snapshot" INTEGER NOT NULL DEFAULT 0;
-- AlterTable
ALTER TABLE "packages"
ADD COLUMN "max_quantity" INTEGER NOT NULL DEFAULT 12,
    ADD COLUMN "min_quantity" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN "price_per_unit_minor" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "step_quantity" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN "unit" "PackageUnit" NOT NULL DEFAULT 'FIXED_MINUTES';
-- AlterTable
ALTER TABLE "services"
ADD COLUMN "max_quantity" INTEGER NOT NULL DEFAULT 20,
    ADD COLUMN "min_quantity" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN "price_minor" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "step_quantity" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN "unit" "ServiceUnit" NOT NULL DEFAULT 'FIXED';