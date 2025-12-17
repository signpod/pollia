-- AlterTable
ALTER TABLE "mission_completions" ADD COLUMN     "image_file_upload_id" TEXT,
ALTER COLUMN "image_url" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "mission_completions" ADD CONSTRAINT "mission_completions_image_file_upload_id_fkey" FOREIGN KEY ("image_file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
