/*
  Warnings:

  - Added the required column `shortAbout` to the `Eatery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Eatery" ADD COLUMN     "shortAbout" TEXT NOT NULL DEFAULT '';
