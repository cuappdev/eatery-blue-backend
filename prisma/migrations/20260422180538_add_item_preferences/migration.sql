-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dislikedItemKeys" TEXT[],
ADD COLUMN     "likedItemKeys" TEXT[];

-- CreateTable
CREATE TABLE "ItemPreferenceCounts" (
    "itemKey" TEXT NOT NULL,
    "numLikes" INTEGER NOT NULL DEFAULT 0,
    "numDislikes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ItemPreferenceCounts_pkey" PRIMARY KEY ("itemKey")
);
