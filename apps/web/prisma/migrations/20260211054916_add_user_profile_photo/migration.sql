/*
  Warnings:

  - A unique constraint covering the columns `[profile_image_file_upload_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profile_image_file_upload_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_image_file_upload_id_key" ON "users"("profile_image_file_upload_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profile_image_file_upload_id_fkey" FOREIGN KEY ("profile_image_file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
