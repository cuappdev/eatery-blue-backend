/*
  Warnings:

  - The primary key for the `FavoritedEatery` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `eateryId` on the `FavoritedEatery` table. All the data in the column will be lost.
  - Added the required column `cornellId` to the `FavoritedEatery` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FavoritedEatery" DROP CONSTRAINT "FavoritedEatery_eateryId_fkey";

-- AlterTable
ALTER TABLE "Eatery" ALTER COLUMN "announcements" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "FavoritedEatery" DROP CONSTRAINT "FavoritedEatery_pkey",
DROP COLUMN "eateryId",
ADD COLUMN     "cornellId" INTEGER NOT NULL,
ADD CONSTRAINT "FavoritedEatery_pkey" PRIMARY KEY ("userId", "cornellId");
