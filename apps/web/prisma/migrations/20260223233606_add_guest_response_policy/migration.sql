-- DropForeignKey
ALTER TABLE "mission_responses" DROP CONSTRAINT "mission_responses_user_id_fkey";

-- DropIndex
DROP INDEX "mission_responses_mission_id_user_id_key";

-- AlterTable
ALTER TABLE "mission_responses" ADD COLUMN     "guest_id" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "allow_guest_response" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allow_multiple_responses" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "mission_responses_guest_id_idx" ON "mission_responses"("guest_id");

-- CreateIndex
CREATE INDEX "mission_responses_mission_id_user_id_idx" ON "mission_responses"("mission_id", "user_id");

-- CreateIndex
CREATE INDEX "mission_responses_mission_id_guest_id_idx" ON "mission_responses"("mission_id", "guest_id");

-- AddForeignKey
ALTER TABLE "mission_responses" ADD CONSTRAINT "mission_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
