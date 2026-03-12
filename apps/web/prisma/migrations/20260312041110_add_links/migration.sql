/*
  Warnings:

  - You are about to drop the column `links` on the `mission_completions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "mission_completions" DROP COLUMN "links";

-- CreateTable
CREATE TABLE "completion_links" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "image_url" TEXT,
    "order" INTEGER NOT NULL,
    "mission_completion_id" TEXT NOT NULL,
    "file_upload_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "completion_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "completion_links_mission_completion_id_idx" ON "completion_links"("mission_completion_id");

-- AddForeignKey
ALTER TABLE "completion_links" ADD CONSTRAINT "completion_links_mission_completion_id_fkey" FOREIGN KEY ("mission_completion_id") REFERENCES "mission_completions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completion_links" ADD CONSTRAINT "completion_links_file_upload_id_fkey" FOREIGN KEY ("file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
