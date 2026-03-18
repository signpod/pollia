-- AlterTable
ALTER TABLE "action_options" ADD COLUMN     "is_correct" BOOLEAN NOT NULL DEFAULT false;

-- DataMigration: correctOptionId -> isCorrect
UPDATE "action_options" SET "is_correct" = true
WHERE "id" IN (SELECT "correct_option_id" FROM "actions" WHERE "correct_option_id" IS NOT NULL);
