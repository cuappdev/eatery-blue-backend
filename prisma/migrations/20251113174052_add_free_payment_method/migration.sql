-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'FREE';

-- AlterTable
ALTER TABLE "Eatery" ALTER COLUMN "shortAbout" DROP DEFAULT;
