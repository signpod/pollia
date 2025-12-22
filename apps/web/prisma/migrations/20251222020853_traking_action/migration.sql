-- CreateTable
CREATE TABLE "tracking_action_entries" (
    "id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action_id" TEXT NOT NULL,
    "utm_params" JSONB,
    "entered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_action_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_action_responses" (
    "id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action_id" TEXT NOT NULL,
    "response_content" JSONB NOT NULL,
    "responded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_action_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tracking_action_entries_mission_id_idx" ON "tracking_action_entries"("mission_id");

-- CreateIndex
CREATE INDEX "tracking_action_entries_session_id_idx" ON "tracking_action_entries"("session_id");

-- CreateIndex
CREATE INDEX "tracking_action_entries_user_id_idx" ON "tracking_action_entries"("user_id");

-- CreateIndex
CREATE INDEX "tracking_action_entries_action_id_idx" ON "tracking_action_entries"("action_id");

-- CreateIndex
CREATE INDEX "tracking_action_entries_entered_at_idx" ON "tracking_action_entries"("entered_at");

-- CreateIndex
CREATE INDEX "tracking_action_responses_mission_id_idx" ON "tracking_action_responses"("mission_id");

-- CreateIndex
CREATE INDEX "tracking_action_responses_session_id_idx" ON "tracking_action_responses"("session_id");

-- CreateIndex
CREATE INDEX "tracking_action_responses_user_id_idx" ON "tracking_action_responses"("user_id");

-- CreateIndex
CREATE INDEX "tracking_action_responses_action_id_idx" ON "tracking_action_responses"("action_id");

-- CreateIndex
CREATE INDEX "tracking_action_responses_responded_at_idx" ON "tracking_action_responses"("responded_at");

-- AddForeignKey
ALTER TABLE "tracking_action_entries" ADD CONSTRAINT "tracking_action_entries_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_action_entries" ADD CONSTRAINT "tracking_action_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_action_entries" ADD CONSTRAINT "tracking_action_entries_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_action_responses" ADD CONSTRAINT "tracking_action_responses_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_action_responses" ADD CONSTRAINT "tracking_action_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_action_responses" ADD CONSTRAINT "tracking_action_responses_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
