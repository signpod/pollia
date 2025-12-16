-- AlterTable
ALTER TABLE "rewards" ADD COLUMN     "image_file_upload_id" TEXT;

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_image_file_upload_id_fkey" FOREIGN KEY ("image_file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
