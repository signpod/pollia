-- CreateTable
CREATE TABLE "mission_notion_pages" (
    "id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "notion_page_id" TEXT NOT NULL,
    "notion_page_url" TEXT NOT NULL,
    "last_synced_at" TIMESTAMP(3) NOT NULL,
    "synced_response_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_notion_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mission_notion_pages_mission_id_key" ON "mission_notion_pages"("mission_id");

-- CreateIndex
CREATE INDEX "mission_notion_pages_mission_id_idx" ON "mission_notion_pages"("mission_id");

-- AddForeignKey
ALTER TABLE "mission_notion_pages" ADD CONSTRAINT "mission_notion_pages_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
