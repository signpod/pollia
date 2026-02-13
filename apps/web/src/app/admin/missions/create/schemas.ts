import { missionInputSchema } from "@/schemas/mission";
import {
  MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH,
  MISSION_COMPLETION_TITLE_MAX_LENGTH,
  missionCompletionInputSchema,
} from "@/schemas/mission-completion";
import { z } from "zod";

const completionSchemaWithoutMissionId = missionCompletionInputSchema.omit({ missionId: true });

// 폼에서는 isExposed(boolean) 사용, API 제출 시 type(MissionType)으로 변환
const missionFormSchema = missionInputSchema
  .omit({ type: true })
  .extend({ isExposed: z.boolean() });

const baseSchema = missionFormSchema.extend({
  completion: completionSchemaWithoutMissionId,
});

export const createMissionFunnelSchema = baseSchema;

export type CreateMissionFunnelFormData = z.input<typeof createMissionFunnelSchema>;

export { MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH, MISSION_COMPLETION_TITLE_MAX_LENGTH };
