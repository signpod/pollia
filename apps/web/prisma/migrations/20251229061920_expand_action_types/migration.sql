/*
  Warnings:

  - You are about to drop the column `image_file_upload_id` on the `action_answers` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `action_answers` table. All the data in the column will be lost.

*/

-- ==========================================
-- 1단계: ActionType enum 확장 (먼저 실행)
-- ==========================================
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

ALTER TYPE "ActionType" ADD VALUE 'VIDEO';
ALTER TYPE "ActionType" ADD VALUE 'PDF_UPLOAD';
ALTER TYPE "ActionType" ADD VALUE 'URL';
ALTER TYPE "ActionType" ADD VALUE 'DATE';
ALTER TYPE "ActionType" ADD VALUE 'TIME';
ALTER TYPE "ActionType" ADD VALUE 'PRIVACY_CONSENT';
ALTER TYPE "ActionType" ADD VALUE 'NAME';
ALTER TYPE "ActionType" ADD VALUE 'ADDRESS';
ALTER TYPE "ActionType" ADD VALUE 'PHONE';
ALTER TYPE "ActionType" ADD VALUE 'EMAIL';

-- ==========================================
-- 2단계: imageUrl 삭제 (안전 - 중복 데이터)
-- ==========================================
-- AlterTable
ALTER TABLE "action_answers" DROP COLUMN "image_url";

-- ==========================================
-- 3단계: 새로운 필드들 추가
-- ==========================================

-- Action에 isRequired 추가
ALTER TABLE "actions" ADD COLUMN "is_required" BOOLEAN NOT NULL DEFAULT false;

-- ActionAnswer에 dateAnswers 추가
ALTER TABLE "action_answers" ADD COLUMN "date_answers" TIMESTAMP(3)[];

-- FileUpload에 actionAnswerId 추가 (핵심!)
ALTER TABLE "file_uploads" ADD COLUMN "action_answer_id" TEXT;

-- 인덱스 생성
CREATE INDEX "file_uploads_action_answer_id_idx" ON "file_uploads"("action_answer_id");

-- ==========================================
-- 4단계: 데이터 이동 (핵심!)
-- ==========================================

-- imageFileUploadId 관계를 역방향으로 복사
-- ActionAnswer.imageFileUploadId → FileUpload.actionAnswerId
UPDATE "file_uploads"
SET "action_answer_id" = (
  SELECT aa.id
  FROM "action_answers" aa
  WHERE aa.image_file_upload_id = "file_uploads".id
  LIMIT 1
)
WHERE "id" IN (
  SELECT image_file_upload_id 
  FROM "action_answers" 
  WHERE image_file_upload_id IS NOT NULL
);

-- ==========================================
-- 5단계: 외래키 제약조건 추가
-- ==========================================

-- AddForeignKey
ALTER TABLE "file_uploads" 
ADD CONSTRAINT "file_uploads_action_answer_id_fkey" 
FOREIGN KEY ("action_answer_id") 
REFERENCES "action_answers"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- ==========================================
-- 6단계: 기존 필드 삭제 (데이터 이미 이동됨)
-- ==========================================

-- DropForeignKey (기존 외래키 제거)
ALTER TABLE "action_answers" DROP CONSTRAINT IF EXISTS "action_answers_image_file_upload_id_fkey";

-- 기존 컬럼 삭제
ALTER TABLE "action_answers" DROP COLUMN "image_file_upload_id";
