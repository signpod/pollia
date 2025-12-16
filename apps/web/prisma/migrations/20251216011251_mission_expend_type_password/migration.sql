-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('GENERAL', 'EXPERIENCE_GROUP');

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "password" TEXT,
ADD COLUMN     "type" "MissionType" NOT NULL DEFAULT 'GENERAL';
