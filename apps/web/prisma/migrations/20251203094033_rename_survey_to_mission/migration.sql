-- 테이블명 변경: Survey -> Mission
ALTER TABLE "surveys" RENAME TO "missions";

-- 테이블명 변경: SurveyQuestion -> Action  
ALTER TABLE "survey_questions" RENAME TO "actions";

-- 테이블명 변경: SurveyQuestionOption -> ActionOption
ALTER TABLE "survey_question_options" RENAME TO "action_options";

-- 테이블명 변경: SurveyQuestionAnswer -> ActionAnswer
ALTER TABLE "survey_question_answers" RENAME TO "action_answers";

-- 테이블명 변경: SurveyResponse -> MissionResponse
ALTER TABLE "survey_responses" RENAME TO "mission_responses";

-- 컬럼명 변경: actions 테이블의 survey_id -> mission_id
ALTER TABLE "actions" RENAME COLUMN "survey_id" TO "mission_id";

-- 컬럼명 변경: action_options 테이블의 question_id -> action_id  
ALTER TABLE "action_options" RENAME COLUMN "question_id" TO "action_id";

-- 컬럼명 변경: action_answers 테이블의 question_id -> action_id
ALTER TABLE "action_answers" RENAME COLUMN "question_id" TO "action_id";

-- 컬럼명 변경: mission_responses 테이블의 survey_id -> mission_id
ALTER TABLE "mission_responses" RENAME COLUMN "survey_id" TO "mission_id";

-- UNIQUE 제약 추가: action_options.file_upload_id (1:1 관계)
ALTER TABLE "action_options" ADD CONSTRAINT "action_options_file_upload_id_key" UNIQUE ("file_upload_id");

-- Enum 값 변경: RelatedEntityType
ALTER TYPE "RelatedEntityType" RENAME VALUE 'SURVEY' TO 'MISSION';
ALTER TYPE "RelatedEntityType" RENAME VALUE 'SURVEY_OPTION' TO 'ACTION_OPTION';

-- 인덱스 이름 변경 (자동으로 생성된 인덱스들)
-- 주의: 실제 인덱스 이름은 DB에 따라 다를 수 있으므로, 먼저 확인 후 실행하세요
-- ALTER INDEX "surveys_creator_id_idx" RENAME TO "missions_creator_id_idx";
-- ALTER INDEX "surveys_is_active_idx" RENAME TO "missions_is_active_idx";
-- ALTER INDEX "surveys_reward_id_idx" RENAME TO "missions_reward_id_idx";
-- ALTER INDEX "survey_questions_survey_id_idx" RENAME TO "actions_mission_id_idx";
-- ... 등등 (필요시 추가)

