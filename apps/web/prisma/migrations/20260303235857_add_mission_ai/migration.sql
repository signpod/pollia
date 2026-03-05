-- AlterTable
ALTER TABLE "mission_responses" ADD COLUMN     "selected_completion_id" TEXT;

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "ai_statistics_report" TEXT,
ADD COLUMN     "use_ai_completion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "mission_completion_stats" (
    "id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "mission_completion_id" TEXT NOT NULL,
    "encounter_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_completion_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mission_completion_stats_mission_id_idx" ON "mission_completion_stats"("mission_id");

-- CreateIndex
CREATE INDEX "mission_completion_stats_mission_completion_id_idx" ON "mission_completion_stats"("mission_completion_id");

-- CreateIndex
CREATE UNIQUE INDEX "mission_completion_stats_mission_id_mission_completion_id_key" ON "mission_completion_stats"("mission_id", "mission_completion_id");

-- CreateIndex
CREATE INDEX "mission_responses_selected_completion_id_idx" ON "mission_responses"("selected_completion_id");

-- AddForeignKey
ALTER TABLE "mission_completion_stats" ADD CONSTRAINT "mission_completion_stats_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_completion_stats" ADD CONSTRAINT "mission_completion_stats_mission_completion_id_fkey" FOREIGN KEY ("mission_completion_id") REFERENCES "mission_completions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_responses" ADD CONSTRAINT "mission_responses_selected_completion_id_fkey" FOREIGN KEY ("selected_completion_id") REFERENCES "mission_completions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
