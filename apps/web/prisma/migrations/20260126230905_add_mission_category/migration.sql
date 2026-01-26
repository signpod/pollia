-- CreateEnum
CREATE TYPE "MissionCategory" AS ENUM ('PROMOTION', 'EVENT', 'RESEARCH', 'CHALLENGE', 'QUIZ');

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "category" "MissionCategory" NOT NULL DEFAULT 'EVENT';
