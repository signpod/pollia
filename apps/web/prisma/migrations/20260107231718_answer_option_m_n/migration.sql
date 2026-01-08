/*
  Warnings:

  - You are about to drop the column `option_id` on the `action_answers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "action_answers" DROP CONSTRAINT "action_answers_option_id_fkey";

-- DropIndex
DROP INDEX "action_answers_response_id_action_id_option_id_key";

-- AlterTable
ALTER TABLE "action_answers" DROP COLUMN "option_id";

-- CreateTable
CREATE TABLE "_ActionAnswerToActionOption" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActionAnswerToActionOption_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ActionAnswerToActionOption_B_index" ON "_ActionAnswerToActionOption"("B");

-- AddForeignKey
ALTER TABLE "_ActionAnswerToActionOption" ADD CONSTRAINT "_ActionAnswerToActionOption_A_fkey" FOREIGN KEY ("A") REFERENCES "action_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActionAnswerToActionOption" ADD CONSTRAINT "_ActionAnswerToActionOption_B_fkey" FOREIGN KEY ("B") REFERENCES "action_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
