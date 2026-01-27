-- DropIndex
DROP INDEX "mission_completions_mission_id_key";

-- AlterTable
ALTER TABLE "action_options" ADD COLUMN     "next_action_id" TEXT,
ADD COLUMN     "next_completion_id" TEXT;

-- AlterTable
ALTER TABLE "actions" ADD COLUMN     "next_action_id" TEXT,
ADD COLUMN     "next_completion_id" TEXT,
ALTER COLUMN "order" DROP NOT NULL;

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "entry_action_id" TEXT;

-- CreateIndex
CREATE INDEX "action_options_next_action_id_idx" ON "action_options"("next_action_id");

-- CreateIndex
CREATE INDEX "action_options_next_completion_id_idx" ON "action_options"("next_completion_id");

-- CreateIndex
CREATE INDEX "actions_next_action_id_idx" ON "actions"("next_action_id");

-- CreateIndex
CREATE INDEX "actions_next_completion_id_idx" ON "actions"("next_completion_id");

-- CreateIndex
CREATE INDEX "mission_completions_mission_id_idx" ON "mission_completions"("mission_id");

-- CreateIndex
CREATE INDEX "missions_entry_action_id_idx" ON "missions"("entry_action_id");

-- AddForeignKey
ALTER TABLE "action_options" ADD CONSTRAINT "action_options_next_action_id_fkey" FOREIGN KEY ("next_action_id") REFERENCES "actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_options" ADD CONSTRAINT "action_options_next_completion_id_fkey" FOREIGN KEY ("next_completion_id") REFERENCES "mission_completions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_next_action_id_fkey" FOREIGN KEY ("next_action_id") REFERENCES "actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_next_completion_id_fkey" FOREIGN KEY ("next_completion_id") REFERENCES "mission_completions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_entry_action_id_fkey" FOREIGN KEY ("entry_action_id") REFERENCES "actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
