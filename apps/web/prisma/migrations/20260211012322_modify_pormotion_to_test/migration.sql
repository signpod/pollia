/*
  Warnings:

  - The values [PROMOTION] on the enum `MissionCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MissionCategory_new" AS ENUM ('TEST', 'EVENT', 'RESEARCH', 'CHALLENGE', 'QUIZ');
ALTER TABLE "public"."missions" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "missions" ALTER COLUMN "category" TYPE "MissionCategory_new" USING ("category"::text::"MissionCategory_new");
ALTER TYPE "MissionCategory" RENAME TO "MissionCategory_old";
ALTER TYPE "MissionCategory_new" RENAME TO "MissionCategory";
DROP TYPE "public"."MissionCategory_old";
ALTER TABLE "missions" ALTER COLUMN "category" SET DEFAULT 'EVENT';
COMMIT;
