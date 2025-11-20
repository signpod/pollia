-- ============================================
-- RLS (Row Level Security) 정책
-- ============================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "surveys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "survey_questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "survey_question_options" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "survey_answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "survey_rewards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "file_uploads" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Users 테이블 정책
-- ============================================

-- 사용자는 본인 데이터만 조회 가능
CREATE POLICY "users_select_own" ON "users"
  FOR SELECT
  USING (auth.uid()::text = id);

-- 사용자는 본인 데이터만 수정 가능
CREATE POLICY "users_update_own" ON "users"
  FOR UPDATE
  USING (auth.uid()::text = id);

-- ============================================
-- Surveys 테이블 정책
-- ============================================

-- 누구나 활성화된 설문 조회 가능
CREATE POLICY "surveys_select_active" ON "surveys"
  FOR SELECT
  USING (is_active = true);

-- 사용자는 본인 설문만 생성 가능
CREATE POLICY "surveys_insert_own" ON "surveys"
  FOR INSERT
  WITH CHECK (auth.uid()::text = creator_id);

-- 사용자는 본인 설문만 수정 가능
CREATE POLICY "surveys_update_own" ON "surveys"
  FOR UPDATE
  USING (auth.uid()::text = creator_id);

-- 사용자는 본인 설문만 삭제 가능
CREATE POLICY "surveys_delete_own" ON "surveys"
  FOR DELETE
  USING (auth.uid()::text = creator_id);

-- ============================================
-- Survey Questions 테이블 정책
-- ============================================

-- 누구나 활성화된 설문의 질문 조회 가능
CREATE POLICY "survey_questions_select_active" ON "survey_questions"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "surveys"
      WHERE "surveys".id = "survey_questions".survey_id
      AND "surveys".is_active = true
    )
  );

-- 설문 작성자는 본인 설문에 질문 추가 가능
CREATE POLICY "survey_questions_insert_own_survey" ON "survey_questions"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "surveys"
      WHERE "surveys".id = "survey_questions".survey_id
      AND "surveys".creator_id = auth.uid()::text
    )
  );

-- 설문 작성자는 본인 설문의 질문 수정 가능
CREATE POLICY "survey_questions_update_own_survey" ON "survey_questions"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "surveys"
      WHERE "surveys".id = "survey_questions".survey_id
      AND "surveys".creator_id = auth.uid()::text
    )
  );

-- 설문 작성자는 본인 설문의 질문 삭제 가능
CREATE POLICY "survey_questions_delete_own_survey" ON "survey_questions"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "surveys"
      WHERE "surveys".id = "survey_questions".survey_id
      AND "surveys".creator_id = auth.uid()::text
    )
  );

-- ============================================
-- Survey Question Options 테이블 정책
-- ============================================

-- 누구나 활성화된 설문의 질문 옵션 조회 가능
CREATE POLICY "survey_question_options_select_active" ON "survey_question_options"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "survey_questions" sq
      JOIN "surveys" s ON s.id = sq.survey_id
      WHERE sq.id = "survey_question_options".question_id
      AND s.is_active = true
    )
  );

-- 설문 작성자는 본인 설문의 질문에 옵션 추가 가능
CREATE POLICY "survey_question_options_insert_own_survey" ON "survey_question_options"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "survey_questions" sq
      JOIN "surveys" s ON s.id = sq.survey_id
      WHERE sq.id = "survey_question_options".question_id
      AND s.creator_id = auth.uid()::text
    )
  );

-- 설문 작성자는 본인 설문의 질문 옵션 수정 가능
CREATE POLICY "survey_question_options_update_own_survey" ON "survey_question_options"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "survey_questions" sq
      JOIN "surveys" s ON s.id = sq.survey_id
      WHERE sq.id = "survey_question_options".question_id
      AND s.creator_id = auth.uid()::text
    )
  );

-- 설문 작성자는 본인 설문의 질문 옵션 삭제 가능
CREATE POLICY "survey_question_options_delete_own_survey" ON "survey_question_options"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "survey_questions" sq
      JOIN "surveys" s ON s.id = sq.survey_id
      WHERE sq.id = "survey_question_options".question_id
      AND s.creator_id = auth.uid()::text
    )
  );

-- ============================================
-- Survey Answers 테이블 정책
-- ============================================

-- 사용자는 본인 답변만 조회 가능
CREATE POLICY "survey_answers_select_own" ON "survey_answers"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 사용자는 본인 답변만 생성 가능
CREATE POLICY "survey_answers_insert_own" ON "survey_answers"
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 설문 작성자는 본인 설문의 모든 답변 조회 가능
CREATE POLICY "survey_answers_select_survey_creator" ON "survey_answers"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "survey_questions" sq
      JOIN "surveys" s ON s.id = sq.survey_id
      WHERE sq.id = "survey_answers".question_id
      AND s.creator_id = auth.uid()::text
    )
  );

-- ============================================
-- Survey Rewards 테이블 정책
-- ============================================

-- 누구나 보상 정보 조회 가능
CREATE POLICY "survey_rewards_select_all" ON "survey_rewards"
  FOR SELECT
  USING (true);

-- Admin만 보상 생성 가능
CREATE POLICY "survey_rewards_insert_admin" ON "survey_rewards"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users".id = auth.uid()::text
      AND "users".role = 'ADMIN'
    )
  );

-- Admin만 보상 수정 가능
CREATE POLICY "survey_rewards_update_admin" ON "survey_rewards"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users".id = auth.uid()::text
      AND "users".role = 'ADMIN'
    )
  );

-- Admin만 보상 삭제 가능
CREATE POLICY "survey_rewards_delete_admin" ON "survey_rewards"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users".id = auth.uid()::text
      AND "users".role = 'ADMIN'
    )
  );

-- ============================================
-- File Uploads 테이블 정책
-- ============================================

-- 사용자는 본인 파일만 조회 가능
CREATE POLICY "file_uploads_select_own" ON "file_uploads"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 사용자는 본인 파일만 업로드 가능
CREATE POLICY "file_uploads_insert_own" ON "file_uploads"
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 사용자는 본인 파일만 수정 가능
CREATE POLICY "file_uploads_update_own" ON "file_uploads"
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- 사용자는 본인 파일만 삭제 가능
CREATE POLICY "file_uploads_delete_own" ON "file_uploads"
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- 설문 작성자는 본인 설문 관련 파일 조회 가능
CREATE POLICY "file_uploads_select_survey_creator" ON "file_uploads"
  FOR SELECT
  USING (
    related_entity_type = 'SURVEY' AND
    EXISTS (
      SELECT 1 FROM "surveys"
      WHERE "surveys".id = "file_uploads".related_entity_id
      AND "surveys".creator_id = auth.uid()::text
    )
  );
