/*
  Warnings:

  - The `paymentMethods` column on the `Eatery` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MEAL_SWIPE', 'CASH', 'CARD', 'BRB');

-- AlterTable
ALTER TABLE "Eatery" DROP COLUMN "paymentMethods",
ADD COLUMN     "paymentMethods" "PaymentMethod"[];

-- DropEnum
DROP TYPE "PaymentMethods";
