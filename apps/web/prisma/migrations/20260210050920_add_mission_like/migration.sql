-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "likes_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "mission_likes" (
    "id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mission_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mission_likes_user_id_idx" ON "mission_likes"("user_id");

-- CreateIndex
CREATE INDEX "mission_likes_mission_id_idx" ON "mission_likes"("mission_id");

-- CreateIndex
CREATE UNIQUE INDEX "mission_likes_mission_id_user_id_key" ON "mission_likes"("mission_id", "user_id");

-- AddForeignKey
ALTER TABLE "mission_likes" ADD CONSTRAINT "mission_likes_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_likes" ADD CONSTRAINT "mission_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
