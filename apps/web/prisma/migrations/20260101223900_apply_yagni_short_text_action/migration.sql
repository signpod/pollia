/*
  Warnings:

  - The values [URL,NAME,ADDRESS,PHONE,EMAIL] on the enum `ActionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActionType_new" AS ENUM ('MULTIPLE_CHOICE', 'SCALE', 'RATING', 'TAG', 'SUBJECTIVE', 'SHORT_TEXT', 'IMAGE', 'VIDEO', 'PDF', 'DATE', 'TIME', 'PRIVACY_CONSENT');
ALTER TABLE "actions" ALTER COLUMN "type" TYPE "ActionType_new" USING ("type"::text::"ActionType_new");
ALTER TYPE "ActionType" RENAME TO "ActionType_old";
ALTER TYPE "ActionType_new" RENAME TO "ActionType";
DROP TYPE "public"."ActionType_old";
COMMIT;
