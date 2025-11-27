-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."FileStatus" AS ENUM ('TEMPORARY', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('IMMEDIATE', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "public"."RelatedEntityType" AS ENUM ('SURVEY', 'SURVEY_OPTION');

-- CreateEnum
CREATE TYPE "public"."SurveyQuestionType" AS ENUM ('MULTIPLE_CHOICE', 'SCALE', 'SUBJECTIVE');

-- CreateTable
CREATE TABLE "public"."file_uploads" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "bucket" TEXT NOT NULL DEFAULT 'poll-images',
    "status" "public"."FileStatus" NOT NULL DEFAULT 'TEMPORARY',
    "related_entity_type" "public"."RelatedEntityType",
    "related_entity_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."survey_answers" (
    "id" TEXT NOT NULL,
    "option_id" TEXT,
    "text_answer" TEXT,
    "scale_answer" INTEGER,
    "question_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."survey_question_options" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "order" INTEGER NOT NULL,
    "question_id" TEXT NOT NULL,
    "file_upload_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."survey_questions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "type" "public"."SurveyQuestionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "max_selections" INTEGER,
    "survey_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."survey_rewards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "payment_type" "public"."PaymentType" NOT NULL,
    "scheduled_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "image_url" TEXT,

    CONSTRAINT "survey_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."surveys" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "brand_logo_url" TEXT,
    "estimated_minutes" INTEGER,
    "deadline" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "creator_id" TEXT NOT NULL,
    "reward_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "target" TEXT,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_uploads_related_entity_type_related_entity_id_idx" ON "public"."file_uploads"("related_entity_type" ASC, "related_entity_id" ASC);

-- CreateIndex
CREATE INDEX "file_uploads_status_created_at_idx" ON "public"."file_uploads"("status" ASC, "created_at" ASC);

-- CreateIndex
CREATE INDEX "file_uploads_user_id_status_idx" ON "public"."file_uploads"("user_id" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "survey_answers_question_id_user_id_idx" ON "public"."survey_answers"("question_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "survey_answers_question_id_user_id_option_id_key" ON "public"."survey_answers"("question_id" ASC, "user_id" ASC, "option_id" ASC);

-- CreateIndex
CREATE INDEX "survey_answers_user_id_idx" ON "public"."survey_answers"("user_id" ASC);

-- CreateIndex
CREATE INDEX "survey_question_options_question_id_idx" ON "public"."survey_question_options"("question_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "survey_question_options_question_id_order_key" ON "public"."survey_question_options"("question_id" ASC, "order" ASC);

-- CreateIndex
CREATE INDEX "survey_questions_survey_id_idx" ON "public"."survey_questions"("survey_id" ASC);

-- CreateIndex
CREATE INDEX "surveys_creator_id_idx" ON "public"."surveys"("creator_id" ASC);

-- CreateIndex
CREATE INDEX "surveys_is_active_idx" ON "public"."surveys"("is_active" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "surveys_reward_id_key" ON "public"."surveys"("reward_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."file_uploads" ADD CONSTRAINT "file_uploads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_answers" ADD CONSTRAINT "survey_answers_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."survey_question_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_answers" ADD CONSTRAINT "survey_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."survey_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_answers" ADD CONSTRAINT "survey_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_question_options" ADD CONSTRAINT "survey_question_options_file_upload_id_fkey" FOREIGN KEY ("file_upload_id") REFERENCES "public"."file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_question_options" ADD CONSTRAINT "survey_question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."survey_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_questions" ADD CONSTRAINT "survey_questions_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."survey_rewards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

