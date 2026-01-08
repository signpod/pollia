/*
  Warnings:

  - A unique constraint covering the columns `[response_id,action_id]` on the table `action_answers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "action_answers_response_id_action_id_key" ON "action_answers"("response_id", "action_id");
