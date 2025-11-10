-- CreateEnum
CREATE TYPE "CampusArea" AS ENUM ('WEST', 'NORTH', 'CENTRAL', 'COLLEGETOWN', 'NONE');

-- CreateEnum
CREATE TYPE "PaymentMethods" AS ENUM ('MEAL_SWIPE', 'CASH', 'CARD', 'BRB');

-- CreateEnum
CREATE TYPE "EateryType" AS ENUM ('DINING_ROOM', 'CAFE', 'COFFEE_SHOP');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('BREAKFAST', 'BRUNCH', 'LUNCH', 'DINNER', 'GENERAL', 'CAFE', 'PANTS');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "favoritedItemNames" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoritedEatery" (
    "userId" INTEGER NOT NULL,
    "eateryId" INTEGER NOT NULL,

    CONSTRAINT "FavoritedEatery_pkey" PRIMARY KEY ("userId","eateryId")
);

-- CreateTable
CREATE TABLE "FCMToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "FCMToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "netid" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "eateryId" INTEGER,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eatery" (
    "id" SERIAL NOT NULL,
    "cornellId" INTEGER,
    "announcements" TEXT[],
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "cornellDining" BOOLEAN NOT NULL,
    "menuSummary" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "campusArea" "CampusArea" NOT NULL,
    "onlineOrderUrl" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "paymentMethods" "PaymentMethods"[],
    "eateryType" "EateryType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Eatery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "type" "EventType" NOT NULL,
    "startTimestamp" TIMESTAMP(3) NOT NULL,
    "endTimestamp" TIMESTAMP(3) NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eateryId" INTEGER NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEventVote" (
    "upvoted" BOOLEAN NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "UserEventVote_pkey" PRIMARY KEY ("userId","eventId")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "basePrice" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "User_deviceId_key" ON "User"("deviceId");

-- CreateIndex
CREATE INDEX "User_deviceId_idx" ON "User"("deviceId");

-- CreateIndex
CREATE INDEX "User_favoritedItemNames_idx" ON "User" USING GIN ("favoritedItemNames");

-- CreateIndex
CREATE UNIQUE INDEX "FCMToken_token_key" ON "FCMToken"("token");

-- CreateIndex
CREATE INDEX "FCMToken_userId_idx" ON "FCMToken"("userId");

-- CreateIndex
CREATE INDEX "Report_eateryId_idx" ON "Report"("eateryId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Eatery_cornellId_key" ON "Eatery"("cornellId");

-- CreateIndex
CREATE INDEX "Event_eateryId_startTimestamp_endTimestamp_idx" ON "Event"("eateryId", "startTimestamp", "endTimestamp");

-- CreateIndex
CREATE INDEX "UserEventVote_eventId_idx" ON "UserEventVote"("eventId");

-- CreateIndex
CREATE INDEX "Category_eventId_idx" ON "Category"("eventId");

-- CreateIndex
CREATE INDEX "Item_categoryId_idx" ON "Item"("categoryId");

-- CreateIndex
CREATE INDEX "Item_name_idx" ON "Item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DietaryPreference_name_key" ON "DietaryPreference"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Allergen_name_key" ON "Allergen"("name");

-- CreateIndex
CREATE INDEX "_DietaryPreferenceToItem_B_index" ON "_DietaryPreferenceToItem"("B");

-- CreateIndex
CREATE INDEX "_AllergenToItem_B_index" ON "_AllergenToItem"("B");

-- AddForeignKey
ALTER TABLE "FavoritedEatery" ADD CONSTRAINT "FavoritedEatery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritedEatery" ADD CONSTRAINT "FavoritedEatery_eateryId_fkey" FOREIGN KEY ("eateryId") REFERENCES "Eatery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
