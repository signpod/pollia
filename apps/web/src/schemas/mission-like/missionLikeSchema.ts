import { z } from "zod";

const missionIdSchema = z.string().min(1, "미션 ID가 필요합니다.");

export const toggleMissionLikeSchema = z.object({
  missionId: missionIdSchema,
});

export type ToggleMissionLikeInput = z.infer<typeof toggleMissionLikeSchema>;
