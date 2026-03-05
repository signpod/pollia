-- CreateEnum
CREATE TYPE "MissionCompletionInferenceSource" AS ENUM ('AI', 'FALLBACK');

-- CreateTable
CREATE TABLE "mission_completion_inference_caches" (
    "id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "fingerprint_hash" TEXT NOT NULL,
    "fingerprint_payload" JSONB NOT NULL,
    "mission_completion_id" TEXT NOT NULL,
    "source" "MissionCompletionInferenceSource" NOT NULL,
    "confidence" DOUBLE PRECISION,
    "model_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_completion_inference_caches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mission_completion_inference_caches_mission_id_idx" ON "mission_completion_inference_caches"("mission_id");

-- CreateIndex
CREATE INDEX "mission_completion_inference_caches_mission_completion_id_idx" ON "mission_completion_inference_caches"("mission_completion_id");

-- CreateIndex
CREATE UNIQUE INDEX "mission_completion_inference_caches_mission_id_fingerprint__key" ON "mission_completion_inference_caches"("mission_id", "fingerprint_hash");

-- AddForeignKey
ALTER TABLE "mission_completion_inference_caches" ADD CONSTRAINT "mission_completion_inference_caches_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_completion_inference_caches" ADD CONSTRAINT "mission_completion_inference_caches_mission_completion_id_fkey" FOREIGN KEY ("mission_completion_id") REFERENCES "mission_completions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
