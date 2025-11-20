/*
  Warnings:

  - You are about to drop the `survey_rewards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "surveys" DROP CONSTRAINT "surveys_reward_id_fkey";

-- DropIndex
DROP INDEX "surveys_reward_id_key";

-- DropTable
DROP TABLE "survey_rewards";

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "payment_type" "PaymentType" NOT NULL,
    "scheduled_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "surveys_reward_id_idx" ON "surveys"("reward_id");

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
