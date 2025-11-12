/*
  Warnings:

  - Changed the column `eateryType` on the `Eatery` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EateryType" ADD VALUE 'FOOD_COURT';
ALTER TYPE "EateryType" ADD VALUE 'CONVENIENCE_STORE';
ALTER TYPE "EateryType" ADD VALUE 'CART';
-- AlterTable
ALTER TABLE "Eatery" ALTER COLUMN "eateryType" SET DATA TYPE "EateryType"[] USING ARRAY["eateryType"]::"EateryType"[];
