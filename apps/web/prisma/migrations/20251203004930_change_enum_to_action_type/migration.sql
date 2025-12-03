-- AlterTable
ALTER TABLE "action_answers" RENAME CONSTRAINT "survey_question_answers_pkey" TO "action_answers_pkey";

-- AlterTable
ALTER TABLE "action_options" RENAME CONSTRAINT "survey_question_options_pkey" TO "action_options_pkey";

-- AlterTable
ALTER TABLE "actions" RENAME CONSTRAINT "survey_questions_pkey" TO "actions_pkey";

-- AlterTable
ALTER TABLE "mission_responses" RENAME CONSTRAINT "survey_responses_pkey" TO "mission_responses_pkey";

-- AlterTable
ALTER TABLE "missions" RENAME CONSTRAINT "surveys_pkey" TO "missions_pkey";

-- RenameForeignKey
ALTER TABLE "action_answers" RENAME CONSTRAINT "survey_question_answers_option_id_fkey" TO "action_answers_option_id_fkey";

-- RenameForeignKey
ALTER TABLE "action_answers" RENAME CONSTRAINT "survey_question_answers_question_id_fkey" TO "action_answers_action_id_fkey";

-- RenameForeignKey
ALTER TABLE "action_answers" RENAME CONSTRAINT "survey_question_answers_response_id_fkey" TO "action_answers_response_id_fkey";

-- RenameForeignKey
ALTER TABLE "action_options" RENAME CONSTRAINT "survey_question_options_file_upload_id_fkey" TO "action_options_file_upload_id_fkey";

-- RenameForeignKey
ALTER TABLE "action_options" RENAME CONSTRAINT "survey_question_options_question_id_fkey" TO "action_options_action_id_fkey";

-- RenameForeignKey
ALTER TABLE "actions" RENAME CONSTRAINT "survey_questions_survey_id_fkey" TO "actions_mission_id_fkey";

-- RenameForeignKey
ALTER TABLE "mission_responses" RENAME CONSTRAINT "survey_responses_survey_id_fkey" TO "mission_responses_mission_id_fkey";

-- RenameForeignKey
ALTER TABLE "mission_responses" RENAME CONSTRAINT "survey_responses_user_id_fkey" TO "mission_responses_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "missions" RENAME CONSTRAINT "surveys_creator_id_fkey" TO "missions_creator_id_fkey";

-- RenameForeignKey
ALTER TABLE "missions" RENAME CONSTRAINT "surveys_reward_id_fkey" TO "missions_reward_id_fkey";

-- RenameIndex
ALTER INDEX "survey_question_answers_question_id_idx" RENAME TO "action_answers_action_id_idx";

-- RenameIndex
ALTER INDEX "survey_question_answers_response_id_idx" RENAME TO "action_answers_response_id_idx";

-- RenameIndex
ALTER INDEX "survey_question_answers_response_id_question_id_option_id_key" RENAME TO "action_answers_response_id_action_id_option_id_key";

-- RenameIndex
ALTER INDEX "survey_question_options_question_id_idx" RENAME TO "action_options_action_id_idx";

-- RenameIndex
ALTER INDEX "survey_question_options_question_id_order_key" RENAME TO "action_options_action_id_order_key";

-- RenameIndex
ALTER INDEX "survey_questions_survey_id_idx" RENAME TO "actions_mission_id_idx";

-- RenameIndex
ALTER INDEX "survey_responses_completed_at_idx" RENAME TO "mission_responses_completed_at_idx";

-- RenameIndex
ALTER INDEX "survey_responses_survey_id_idx" RENAME TO "mission_responses_mission_id_idx";

-- RenameIndex
ALTER INDEX "survey_responses_survey_id_user_id_key" RENAME TO "mission_responses_mission_id_user_id_key";

-- RenameIndex
ALTER INDEX "survey_responses_user_id_idx" RENAME TO "mission_responses_user_id_idx";

-- RenameIndex
ALTER INDEX "surveys_creator_id_idx" RENAME TO "missions_creator_id_idx";

-- RenameIndex
ALTER INDEX "surveys_is_active_idx" RENAME TO "missions_is_active_idx";

-- RenameIndex
ALTER INDEX "surveys_reward_id_idx" RENAME TO "missions_reward_id_idx";
