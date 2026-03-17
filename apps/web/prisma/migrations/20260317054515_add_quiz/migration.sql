/*
  Warnings:

  - A unique constraint covering the columns `[correct_option_id]` on the table `actions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MatchMode" AS ENUM ('EXACT', 'CONTAINS');

-- AlterEnum
ALTER TYPE "ActionType" ADD VALUE 'OX';

-- AlterTable
ALTER TABLE "actions" ADD COLUMN     "correct_option_id" TEXT,
ADD COLUMN     "hint" TEXT,
ADD COLUMN     "match_mode" "MatchMode",
ADD COLUMN     "score" INTEGER;

-- AlterTable
ALTER TABLE "mission_completions" ADD COLUMN     "max_score_ratio" INTEGER,
ADD COLUMN     "min_score_ratio" INTEGER;

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "quiz_config" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "actions_correct_option_id_key" ON "actions"("correct_option_id");

-- CreateIndex
CREATE INDEX "actions_correct_option_id_idx" ON "actions"("correct_option_id");

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_correct_option_id_fkey" FOREIGN KEY ("correct_option_id") REFERENCES "action_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;
