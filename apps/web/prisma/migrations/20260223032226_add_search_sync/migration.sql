-- CreateEnum
CREATE TYPE "SearchSyncEntityType" AS ENUM ('MISSION');

-- CreateEnum
CREATE TYPE "SearchSyncAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "SearchSyncStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "choseong" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "search_sync_outbox" (
    "id" TEXT NOT NULL,
    "entity_type" "SearchSyncEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" "SearchSyncAction" NOT NULL,
    "payload" JSONB,
    "status" "SearchSyncStatus" NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_sync_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "search_sync_outbox_status_next_retry_at_idx" ON "search_sync_outbox"("status", "next_retry_at");

-- CreateIndex
CREATE INDEX "search_sync_outbox_entity_type_entity_id_created_at_idx" ON "search_sync_outbox"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "search_sync_outbox_created_at_idx" ON "search_sync_outbox"("created_at");
