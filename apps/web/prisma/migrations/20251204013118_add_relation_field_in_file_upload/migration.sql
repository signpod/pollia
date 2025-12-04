/*
  Warnings:

  - A unique constraint covering the columns `[image_file_upload_id]` on the table `actions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[image_file_upload_id]` on the table `missions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[brand_logo_file_upload_id]` on the table `missions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "RelatedEntityType" ADD VALUE 'ACTION';

-- AlterTable
ALTER TABLE "actions" ADD COLUMN     "image_file_upload_id" TEXT;

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "brand_logo_file_upload_id" TEXT,
ADD COLUMN     "image_file_upload_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "actions_image_file_upload_id_key" ON "actions"("image_file_upload_id");

-- CreateIndex
CREATE UNIQUE INDEX "missions_image_file_upload_id_key" ON "missions"("image_file_upload_id");

-- CreateIndex
CREATE UNIQUE INDEX "missions_brand_logo_file_upload_id_key" ON "missions"("brand_logo_file_upload_id");

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_image_file_upload_id_fkey" FOREIGN KEY ("image_file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_image_file_upload_id_fkey" FOREIGN KEY ("image_file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_brand_logo_file_upload_id_fkey" FOREIGN KEY ("brand_logo_file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
