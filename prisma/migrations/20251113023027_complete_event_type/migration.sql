/*
  Warnings:

  - The values [CAFE] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('AVAILABLE_ALL_DAY', 'BREAKFAST', 'BRUNCH', 'DINNER', 'EMPTY', 'LATE_LUNCH', 'LUNCH', 'OPEN', 'GENERAL', 'PANTS');
ALTER TABLE "Event" ALTER COLUMN "type" TYPE "EventType_new" USING ("type"::text::"EventType_new");
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "public"."EventType_old";
COMMIT;
