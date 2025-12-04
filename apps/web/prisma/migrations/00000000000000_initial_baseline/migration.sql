-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('MULTIPLE_CHOICE', 'SCALE', 'RATING', 'TAG', 'SUBJECTIVE', 'IMAGE');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('TEMPORARY', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "RelatedEntityType" AS ENUM ('MISSION', 'ACTION_OPTION', 'ACTION');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('IMMEDIATE', 'SCHEDULED');

-- CreateTable
CREATE TABLE "action_answers" (
    "id" TEXT NOT NULL,
    "option_id" TEXT,
    "text_answer" TEXT,
    "scale_answer" INTEGER,
    "action_id" TEXT NOT NULL,
    "response_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_options" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "order" INTEGER NOT NULL,
    "action_id" TEXT NOT NULL,
    "file_upload_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "type" "ActionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "max_selections" INTEGER,
    "mission_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "image_file_upload_id" TEXT,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploads" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "bucket" TEXT NOT NULL DEFAULT 'poll-images',
    "status" "FileStatus" NOT NULL DEFAULT 'TEMPORARY',
    "related_entity_type" "RelatedEntityType",
    "related_entity_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
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
    "brand_logo_file_upload_id" TEXT,
    "image_file_upload_id" TEXT,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_responses" (
    "id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "mission_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "payment_type" "PaymentType" NOT NULL,
    "scheduled_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "action_answers_action_id_idx" ON "action_answers"("action_id");

-- CreateIndex
CREATE INDEX "action_answers_response_id_idx" ON "action_answers"("response_id");

-- CreateIndex
CREATE UNIQUE INDEX "action_answers_response_id_action_id_option_id_key" ON "action_answers"("response_id", "action_id", "option_id");

-- CreateIndex
CREATE UNIQUE INDEX "action_options_file_upload_id_key" ON "action_options"("file_upload_id");

-- CreateIndex
CREATE INDEX "action_options_action_id_idx" ON "action_options"("action_id");

-- CreateIndex
CREATE UNIQUE INDEX "action_options_action_id_order_key" ON "action_options"("action_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "actions_image_file_upload_id_key" ON "actions"("image_file_upload_id");

-- CreateIndex
CREATE INDEX "actions_mission_id_idx" ON "actions"("mission_id");

-- CreateIndex
CREATE INDEX "file_uploads_user_id_status_idx" ON "file_uploads"("user_id", "status");

-- CreateIndex
CREATE INDEX "file_uploads_status_created_at_idx" ON "file_uploads"("status", "created_at");

-- CreateIndex
CREATE INDEX "file_uploads_related_entity_type_related_entity_id_idx" ON "file_uploads"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "missions_brand_logo_file_upload_id_key" ON "missions"("brand_logo_file_upload_id");

-- CreateIndex
CREATE UNIQUE INDEX "missions_image_file_upload_id_key" ON "missions"("image_file_upload_id");

-- CreateIndex
CREATE INDEX "missions_creator_id_idx" ON "missions"("creator_id");

-- CreateIndex
CREATE INDEX "missions_is_active_idx" ON "missions"("is_active");

-- CreateIndex
CREATE INDEX "missions_reward_id_idx" ON "missions"("reward_id");

-- CreateIndex
CREATE INDEX "mission_responses_mission_id_idx" ON "mission_responses"("mission_id");

-- CreateIndex
CREATE INDEX "mission_responses_user_id_idx" ON "mission_responses"("user_id");

-- CreateIndex
CREATE INDEX "mission_responses_completed_at_idx" ON "mission_responses"("completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "mission_responses_mission_id_user_id_key" ON "mission_responses"("mission_id", "user_id");

-- AddForeignKey
ALTER TABLE "action_answers" ADD CONSTRAINT "action_answers_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_answers" ADD CONSTRAINT "action_answers_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "action_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_answers" ADD CONSTRAINT "action_answers_response_id_fkey" FOREIGN KEY ("response_id") REFERENCES "mission_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_options" ADD CONSTRAINT "action_options_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_options" ADD CONSTRAINT "action_options_file_upload_id_fkey" FOREIGN KEY ("file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_image_file_upload_id_fkey" FOREIGN KEY ("image_file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_brand_logo_file_upload_id_fkey" FOREIGN KEY ("brand_logo_file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_image_file_upload_id_fkey" FOREIGN KEY ("image_file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_responses" ADD CONSTRAINT "mission_responses_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_responses" ADD CONSTRAINT "mission_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

