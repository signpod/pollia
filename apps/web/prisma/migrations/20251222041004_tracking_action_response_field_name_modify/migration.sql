/*
  Warnings:

  - You are about to drop the column `response_content` on the `tracking_action_responses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tracking_action_responses" DROP COLUMN "response_content",
ADD COLUMN     "metadata" JSONB;
