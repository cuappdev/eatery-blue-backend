/*
  Warnings:

  - You are about to drop the column `eateryType` on the `Eatery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Eatery" DROP COLUMN "eateryType",
ADD COLUMN     "eateryTypes" "EateryType"[];
