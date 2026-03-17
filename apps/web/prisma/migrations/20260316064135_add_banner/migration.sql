-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image_url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "image_file_upload_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "banners_image_file_upload_id_key" ON "banners"("image_file_upload_id");

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_image_file_upload_id_fkey" FOREIGN KEY ("image_file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
