/*
  Warnings:

  - The values [PDF_UPLOAD] on the enum `ActionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActionType_new" AS ENUM ('MULTIPLE_CHOICE', 'SCALE', 'RATING', 'TAG', 'SUBJECTIVE', 'IMAGE', 'VIDEO', 'PDF', 'URL', 'DATE', 'TIME', 'PRIVACY_CONSENT', 'NAME', 'ADDRESS', 'PHONE', 'EMAIL');
ALTER TABLE "actions" ALTER COLUMN "type" TYPE "ActionType_new" USING ("type"::text::"ActionType_new");
ALTER TYPE "ActionType" RENAME TO "ActionType_old";
ALTER TYPE "ActionType_new" RENAME TO "ActionType";
DROP TYPE "public"."ActionType_old";
COMMIT;
