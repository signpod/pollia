/*
  Warnings:

  - You are about to drop the `survey_answers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "survey_answers" DROP CONSTRAINT "survey_answers_option_id_fkey";

-- DropForeignKey
ALTER TABLE "survey_answers" DROP CONSTRAINT "survey_answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "survey_answers" DROP CONSTRAINT "survey_answers_user_id_fkey";

-- DropTable
DROP TABLE "survey_answers";

-- CreateTable
CREATE TABLE "survey_question_answers" (
    "id" TEXT NOT NULL,
    "option_id" TEXT,
    "text_answer" TEXT,
    "scale_answer" INTEGER,
    "question_id" TEXT NOT NULL,
    "response_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_responses" (
    "id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "survey_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "survey_question_answers_question_id_idx" ON "survey_question_answers"("question_id");

-- CreateIndex
CREATE INDEX "survey_question_answers_response_id_idx" ON "survey_question_answers"("response_id");

-- CreateIndex
CREATE UNIQUE INDEX "survey_question_answers_response_id_question_id_option_id_key" ON "survey_question_answers"("response_id", "question_id", "option_id");

-- CreateIndex
CREATE INDEX "survey_responses_survey_id_idx" ON "survey_responses"("survey_id");

-- CreateIndex
CREATE INDEX "survey_responses_user_id_idx" ON "survey_responses"("user_id");

-- CreateIndex
CREATE INDEX "survey_responses_completed_at_idx" ON "survey_responses"("completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "survey_responses_survey_id_user_id_key" ON "survey_responses"("survey_id", "user_id");

-- AddForeignKey
ALTER TABLE "survey_question_answers" ADD CONSTRAINT "survey_question_answers_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "survey_question_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_question_answers" ADD CONSTRAINT "survey_question_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "survey_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_question_answers" ADD CONSTRAINT "survey_question_answers_response_id_fkey" FOREIGN KEY ("response_id") REFERENCES "survey_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
