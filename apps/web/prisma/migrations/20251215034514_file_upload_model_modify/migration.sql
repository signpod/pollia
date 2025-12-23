/*
  Warnings:

  - You are about to drop the column `related_entity_id` on the `file_uploads` table. All the data in the column will be lost.
  - You are about to drop the column `related_entity_type` on the `file_uploads` table. All the data in the column will be lost.

*/
-- Drop UNIQUE (handles both INDEX from baseline and CONSTRAINT from real DB)
-- Shadow DB has INDEX, Real DB has CONSTRAINT
DROP INDEX IF EXISTS "action_options_file_upload_id_key";
ALTER TABLE "action_options" DROP CONSTRAINT IF EXISTS "action_options_file_upload_id_key";

DROP INDEX IF EXISTS "actions_image_file_upload_id_key";
ALTER TABLE "actions" DROP CONSTRAINT IF EXISTS "actions_image_file_upload_id_key";

DROP INDEX IF EXISTS "file_uploads_related_entity_type_related_entity_id_idx";

DROP INDEX IF EXISTS "missions_brand_logo_file_upload_id_key";
ALTER TABLE "missions" DROP CONSTRAINT IF EXISTS "missions_brand_logo_file_upload_id_key";

DROP INDEX IF EXISTS "missions_image_file_upload_id_key";
ALTER TABLE "missions" DROP CONSTRAINT IF EXISTS "missions_image_file_upload_id_key";

-- AlterTable
ALTER TABLE "action_answers" ADD COLUMN     "image_file_upload_id" TEXT,
ADD COLUMN     "image_url" TEXT;

-- Drop RLS policy that depends on related_entity_id
DROP POLICY IF EXISTS "file_uploads_select_survey_creator" ON "file_uploads";

-- AlterTable
ALTER TABLE "file_uploads" DROP COLUMN "related_entity_id",
DROP COLUMN "related_entity_type",
ALTER COLUMN "bucket" SET DEFAULT 'pollia-images';

-- DropEnum
DROP TYPE "RelatedEntityType";

-- AddForeignKey
ALTER TABLE "action_answers" ADD CONSTRAINT "action_answers_image_file_upload_id_fkey" FOREIGN KEY ("image_file_upload_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
