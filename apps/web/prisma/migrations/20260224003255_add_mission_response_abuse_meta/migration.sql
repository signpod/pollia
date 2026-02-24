-- AlterTable
ALTER TABLE "mission_responses" ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "submission_interval_seconds" INTEGER,
ADD COLUMN     "user_agent" TEXT;

-- CreateIndex
CREATE INDEX "mission_responses_mission_id_user_id_completed_at_idx" ON "mission_responses"("mission_id", "user_id", "completed_at");

-- CreateIndex
CREATE INDEX "mission_responses_mission_id_guest_id_completed_at_idx" ON "mission_responses"("mission_id", "guest_id", "completed_at");
