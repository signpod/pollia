import { z } from "zod";

export const trackMissionViewSchema = z.object({
  missionId: z.string().min(1, "미션 ID가 필요합니다."),
});

export type TrackMissionViewInput = z.infer<typeof trackMissionViewSchema>;
