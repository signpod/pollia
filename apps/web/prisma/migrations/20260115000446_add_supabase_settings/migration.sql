-- -------------------------------------------------------------
-- 1. Storage Buckets (버킷 데이터 생성)
-- -------------------------------------------------------------
INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
    ('pollia-images', 'pollia-images', NULL, '2025-09-22 10:48:22.901393+00', '2025-09-22 10:48:22.901393+00', false, false, NULL, NULL, NULL, 'STANDARD'),
    ('poll-images', 'poll-images', NULL, '2025-09-22 10:48:33.1608+00', '2025-09-22 10:48:33.1608+00', true, false, NULL, NULL, NULL, 'STANDARD'),
    ('survey-images', 'survey-images', NULL, '2025-10-29 01:58:02.980705+00', '2025-10-29 01:58:02.980705+00', true, false, NULL, NULL, NULL, 'STANDARD'),
    ('mission-images', 'mission-images', NULL, '2025-12-04 22:43:17.38747+00', '2025-12-04 22:43:17.38747+00', true, false, NULL, NULL, NULL, 'STANDARD'),
    ('action-images', 'action-images', NULL, '2025-12-15 04:17:19.674415+00', '2025-12-15 04:17:19.674415+00', true, false, NULL, NULL, NULL, 'STANDARD'),
    ('action-option-images', 'action-option-images', NULL, '2025-12-15 04:20:54.430508+00', '2025-12-15 04:20:54.430508+00', true, false, NULL, NULL, NULL, 'STANDARD'),
    ('action-answer-images', 'action-answer-images', NULL, '2025-12-15 04:21:03.431188+00', '2025-12-15 04:21:03.431188+00', true, false, NULL, NULL, NULL, 'STANDARD'),
    ('reward-images', 'reward-images', NULL, '2025-12-15 23:19:36.199062+00', '2025-12-15 23:19:36.199062+00', true, false, NULL, NULL, NULL, 'STANDARD'),
    ('action-answer-videos', 'action-answer-videos', NULL, '2025-12-30 05:58:35.439312+00', '2025-12-30 05:58:35.439312+00', true, false, NULL, '{video/mp4,video/webm,video/quicktime,video/x-msvideo}', NULL, 'STANDARD'),
    ('action-answer-pdfs', 'action-answer-pdfs', NULL, '2025-12-30 05:57:32.836057+00', '2025-12-30 05:57:32.836057+00', true, false, NULL, '{application/pdf}', NULL, 'STANDARD')
ON CONFLICT (id) DO NOTHING;


-- -------------------------------------------------------------
-- 2. RLS (Row Level Security) 활성화
-- -------------------------------------------------------------
ALTER TABLE "public"."action_answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."action_options" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."actions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."file_uploads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."mission_completions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."mission_responses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."missions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."rewards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tracking_action_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tracking_action_responses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


-- -------------------------------------------------------------
-- 3. RLS Policies (정책 생성)
-- -------------------------------------------------------------

-- [tracking_action_entries]
CREATE POLICY "Admin users can read all tracking_action_entries" ON "public"."tracking_action_entries" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1 FROM "public"."users" WHERE (("users"."id" = ("auth"."uid"())::"text") AND ("users"."role" = 'ADMIN'::"public"."UserRole")))));
CREATE POLICY "Mission creators can read their mission tracking_action_entries" ON "public"."tracking_action_entries" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1 FROM "public"."missions" WHERE (("missions"."id" = "tracking_action_entries"."mission_id") AND ("missions"."creator_id" = ("auth"."uid"())::"text")))));
CREATE POLICY "Service role can insert tracking_action_entries" ON "public"."tracking_action_entries" FOR INSERT TO "service_role" WITH CHECK (true);

-- [tracking_action_responses]
CREATE POLICY "Admin users can read all tracking_action_responses" ON "public"."tracking_action_responses" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1 FROM "public"."users" WHERE (("users"."id" = ("auth"."uid"())::"text") AND ("users"."role" = 'ADMIN'::"public"."UserRole")))));
CREATE POLICY "Mission creators can read their mission tracking_action_respons" ON "public"."tracking_action_responses" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1 FROM "public"."missions" WHERE (("missions"."id" = "tracking_action_responses"."mission_id") AND ("missions"."creator_id" = ("auth"."uid"())::"text")))));
CREATE POLICY "Service role can insert tracking_action_responses" ON "public"."tracking_action_responses" FOR INSERT TO "service_role" WITH CHECK (true);

-- [action_answers]
CREATE POLICY "action_answers_delete_own" ON "public"."action_answers" FOR DELETE USING (("response_id" IN ( SELECT "mission_responses"."id" FROM "public"."mission_responses" WHERE (("mission_responses"."user_id" = ("auth"."uid"())::"text") AND ("mission_responses"."completed_at" IS NULL)))));
CREATE POLICY "action_answers_insert_own" ON "public"."action_answers" FOR INSERT WITH CHECK (("response_id" IN ( SELECT "mission_responses"."id" FROM "public"."mission_responses" WHERE ("mission_responses"."user_id" = ("auth"."uid"())::"text"))));
CREATE POLICY "action_answers_select_own" ON "public"."action_answers" FOR SELECT USING (("response_id" IN ( SELECT "mission_responses"."id" FROM "public"."mission_responses" WHERE ("mission_responses"."user_id" = ("auth"."uid"())::"text"))));
CREATE POLICY "action_answers_update_own" ON "public"."action_answers" FOR UPDATE USING (("response_id" IN ( SELECT "mission_responses"."id" FROM "public"."mission_responses" WHERE (("mission_responses"."user_id" = ("auth"."uid"())::"text") AND ("mission_responses"."completed_at" IS NULL)))));

-- [file_uploads]
CREATE POLICY "file_uploads_delete_own" ON "public"."file_uploads" FOR DELETE USING ((("auth"."uid"())::"text" = "user_id"));
CREATE POLICY "file_uploads_insert_own" ON "public"."file_uploads" FOR INSERT WITH CHECK ((("auth"."uid"())::"text" = "user_id"));
CREATE POLICY "file_uploads_select_own" ON "public"."file_uploads" FOR SELECT USING ((("auth"."uid"())::"text" = "user_id"));
CREATE POLICY "file_uploads_update_own" ON "public"."file_uploads" FOR UPDATE USING ((("auth"."uid"())::"text" = "user_id"));

-- [mission_completions]
CREATE POLICY "mission_completions_delete_creator" ON "public"."mission_completions" FOR DELETE USING ((EXISTS ( SELECT 1 FROM "public"."missions" WHERE (("missions"."id" = "mission_completions"."mission_id") AND ("missions"."creator_id" = "current_setting"('app.current_user_id'::"text"))))));
CREATE POLICY "mission_completions_insert_creator" ON "public"."mission_completions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1 FROM "public"."missions" WHERE (("missions"."id" = "mission_completions"."mission_id") AND ("missions"."creator_id" = "current_setting"('app.current_user_id'::"text"))))));
CREATE POLICY "mission_completions_select_all" ON "public"."mission_completions" FOR SELECT USING (true);
CREATE POLICY "mission_completions_update_creator" ON "public"."mission_completions" FOR UPDATE USING ((EXISTS ( SELECT 1 FROM "public"."missions" WHERE (("missions"."id" = "mission_completions"."mission_id") AND ("missions"."creator_id" = "current_setting"('app.current_user_id'::"text")))))) WITH CHECK ((EXISTS ( SELECT 1 FROM "public"."missions" WHERE (("missions"."id" = "mission_completions"."mission_id") AND ("missions"."creator_id" = "current_setting"('app.current_user_id'::"text"))))));

-- [mission_responses]
CREATE POLICY "mission_responses_delete_own" ON "public"."mission_responses" FOR DELETE USING ((("user_id" = ("auth"."uid"())::"text") AND ("completed_at" IS NULL)));
CREATE POLICY "mission_responses_insert_authenticated" ON "public"."mission_responses" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("user_id" = ("auth"."uid"())::"text")));
CREATE POLICY "mission_responses_select_own" ON "public"."mission_responses" FOR SELECT USING (("user_id" = ("auth"."uid"())::"text"));
CREATE POLICY "mission_responses_update_own" ON "public"."mission_responses" FOR UPDATE USING (("user_id" = ("auth"."uid"())::"text"));

-- [rewards]
CREATE POLICY "rewards_delete_admin" ON "public"."rewards" FOR DELETE USING (false);
CREATE POLICY "rewards_insert_admin" ON "public"."rewards" FOR INSERT WITH CHECK (false);
CREATE POLICY "rewards_select_all_authenticated" ON "public"."rewards" FOR SELECT USING (("auth"."uid"() IS NOT NULL));
CREATE POLICY "rewards_update_admin" ON "public"."rewards" FOR UPDATE USING (false);

-- [action_options] (Survey Question Options)
CREATE POLICY "survey_question_options_delete_own_survey" ON "public"."action_options" FOR DELETE USING ((EXISTS ( SELECT 1 FROM ("public"."actions" "sq" JOIN "public"."missions" "s" ON (("s"."id" = "sq"."mission_id"))) WHERE (("sq"."id" = "action_options"."action_id") AND ("s"."creator_id" = ("auth"."uid"())::"text")))));
CREATE POLICY "survey_question_options_insert_own_survey" ON "public"."action_options" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1 FROM ("public"."actions" "sq" JOIN "public"."missions" "s" ON (("s"."id" = "sq"."mission_id"))) WHERE (("sq"."id" = "action_options"."action_id") AND ("s"."creator_id" = ("auth"."uid"())::"text")))));
CREATE POLICY "survey_question_options_select_active" ON "public"."action_options" FOR SELECT USING ((EXISTS ( SELECT 1 FROM ("public"."actions" "sq" JOIN "public"."missions" "s" ON (("s"."id" = "sq"."mission_id"))) WHERE (("sq"."id" = "action_options"."action_id") AND ("s"."is_active" = true)))));
CREATE POLICY "survey_question_options_update_own_survey" ON "public"."action_options" FOR UPDATE USING ((EXISTS ( SELECT 1 FROM ("public"."actions" "sq" JOIN "public"."missions" "s" ON (("s"."id" = "sq"."mission_id"))) WHERE (("sq"."id" = "action_options"."action_id") AND ("s"."creator_id" = ("auth"."uid"())::"text")))));

-- [actions] (Survey Questions)
CREATE POLICY "survey_questions_delete_own_survey" ON "public"."actions" FOR DELETE USING ((EXISTS ( SELECT 1 FROM "public"."missions" WHERE (("missions"."id" = "actions"."mission_id") AND ("missions"."creator_id" = ("auth"."uid"())::"text")))));
CREATE POLICY "survey_questions_insert_own_survey" ON "public"."actions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1 FROM "public"."missions" WHERE (("missions"."id" = "actions"."mission_id") AND ("missions"."creator_id" = ("auth"."uid"())::"text")))));
CREATE POLICY "survey_questions_select_active" ON "public"."actions" FOR SELECT USING ((EXISTS ( SELECT 1 FROM "public"."missions" WHERE (("missions"."id" = "actions"."mission_id") AND ("missions"."is_active" = true)))));
CREATE POLICY "survey_questions_update_own_survey" ON "public"."actions" FOR UPDATE USING ((EXISTS ( SELECT 1 FROM "public"."missions" WHERE (("missions"."id" = "actions"."mission_id") AND ("missions"."creator_id" = ("auth"."uid"())::"text")))));

-- [missions] (Surveys)
CREATE POLICY "surveys_delete_own" ON "public"."missions" FOR DELETE USING ((("auth"."uid"())::"text" = "creator_id"));
CREATE POLICY "surveys_insert_own" ON "public"."missions" FOR INSERT WITH CHECK ((("auth"."uid"())::"text" = "creator_id"));
CREATE POLICY "surveys_select_active" ON "public"."missions" FOR SELECT USING (("is_active" = true));
CREATE POLICY "surveys_update_own" ON "public"."missions" FOR UPDATE USING ((("auth"."uid"())::"text" = "creator_id"));

-- [users]
CREATE POLICY "users_select_own" ON "public"."users" FOR SELECT USING ((("auth"."uid"())::"text" = "id"));
CREATE POLICY "users_update_own" ON "public"."users" FOR UPDATE USING ((("auth"."uid"())::"text" = "id"));