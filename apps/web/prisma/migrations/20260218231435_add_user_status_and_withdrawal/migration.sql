-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'WITHDRAWING', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "auth_deleted_at" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "withdrawal_reason" TEXT,
ADD COLUMN     "withdrawn_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");
