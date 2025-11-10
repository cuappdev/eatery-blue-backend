/*
  Warnings:

  - You are about to drop the column `userId` on the `Eatery` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `allergens` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `dietaryPreferences` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the `FavoritedItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cornellId]` on the table `Eatery` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `FCMToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[deviceId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `startTimestamp` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTimestamp` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Eatery" DROP CONSTRAINT "Eatery_userId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_eateryId_fkey";

-- DropForeignKey
ALTER TABLE "FCMToken" DROP CONSTRAINT "FCMToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "FavoritedEatery" DROP CONSTRAINT "FavoritedEatery_userId_fkey";

-- DropForeignKey
ALTER TABLE "FavoritedItem" DROP CONSTRAINT "FavoritedItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "FavoritedItem" DROP CONSTRAINT "FavoritedItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_userId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_eateryId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_userId_fkey";

-- DropIndex
DROP INDEX "Event_date_idx";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Eatery" DROP COLUMN "userId",
ALTER COLUMN "onlineOrderUrl" DROP NOT NULL,
ALTER COLUMN "contactPhone" DROP NOT NULL,
ALTER COLUMN "contactEmail" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "date",
DROP COLUMN "startTimestamp",
ADD COLUMN     "startTimestamp" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endTimestamp",
ADD COLUMN     "endTimestamp" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "upvotes" SET DEFAULT 0,
ALTER COLUMN "downvotes" SET DEFAULT 0,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "FCMToken" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "allergens",
DROP COLUMN "dietaryPreferences",
DROP COLUMN "userId",
ALTER COLUMN "basePrice" DROP NOT NULL,
ALTER COLUMN "basePrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "netid" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "eateryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "favoritedItemNames" TEXT[];

-- DropTable
DROP TABLE "FavoritedItem";

-- DropEnum
DROP TYPE "Allergens";

-- DropEnum
DROP TYPE "DietaryPreferences";

-- CreateTable
CREATE TABLE "UserEventVote" (
    "upvoted" BOOLEAN NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "UserEventVote_pkey" PRIMARY KEY ("userId","eventId")
);

-- CreateTable
CREATE TABLE "DietaryPreference" (
    "name" TEXT NOT NULL,

    CONSTRAINT "DietaryPreference_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Allergen" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Allergen_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "_DietaryPreferenceToItem" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DietaryPreferenceToItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AllergenToItem" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AllergenToItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "UserEventVote_eventId_idx" ON "UserEventVote"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "DietaryPreference_name_key" ON "DietaryPreference"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Allergen_name_key" ON "Allergen"("name");

-- CreateIndex
CREATE INDEX "_DietaryPreferenceToItem_B_index" ON "_DietaryPreferenceToItem"("B");

-- CreateIndex
CREATE INDEX "_AllergenToItem_B_index" ON "_AllergenToItem"("B");

-- CreateIndex
CREATE INDEX "Category_eventId_idx" ON "Category"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Eatery_cornellId_key" ON "Eatery"("cornellId");

-- CreateIndex
CREATE INDEX "Event_eateryId_startTimestamp_endTimestamp_idx" ON "Event"("eateryId", "startTimestamp", "endTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "FCMToken_token_key" ON "FCMToken"("token");

-- CreateIndex
CREATE INDEX "FCMToken_userId_idx" ON "FCMToken"("userId");

-- CreateIndex
CREATE INDEX "Item_categoryId_idx" ON "Item"("categoryId");

-- CreateIndex
CREATE INDEX "Item_name_idx" ON "Item"("name");

-- CreateIndex
CREATE INDEX "Report_eateryId_idx" ON "Report"("eateryId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_deviceId_key" ON "User"("deviceId");

-- CreateIndex
CREATE INDEX "User_deviceId_idx" ON "User"("deviceId");

-- CreateIndex
CREATE INDEX "User_favoritedItemNames_idx" ON "User" USING GIN ("favoritedItemNames");

-- AddForeignKey
ALTER TABLE "FavoritedEatery" ADD CONSTRAINT "FavoritedEatery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FCMToken" ADD CONSTRAINT "FCMToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_eateryId_fkey" FOREIGN KEY ("eateryId") REFERENCES "Eatery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eateryId_fkey" FOREIGN KEY ("eateryId") REFERENCES "Eatery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEventVote" ADD CONSTRAINT "UserEventVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEventVote" ADD CONSTRAINT "UserEventVote_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DietaryPreferenceToItem" ADD CONSTRAINT "_DietaryPreferenceToItem_A_fkey" FOREIGN KEY ("A") REFERENCES "DietaryPreference"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DietaryPreferenceToItem" ADD CONSTRAINT "_DietaryPreferenceToItem_B_fkey" FOREIGN KEY ("B") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllergenToItem" ADD CONSTRAINT "_AllergenToItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Allergen"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllergenToItem" ADD CONSTRAINT "_AllergenToItem_B_fkey" FOREIGN KEY ("B") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
