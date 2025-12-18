import { missionInputSchema } from "@/schemas/mission";
import {
  MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH,
  MISSION_COMPLETION_TITLE_MAX_LENGTH,
  missionCompletionInputSchema,
} from "@/schemas/mission-completion/missionCompletionSchema";
import { z } from "zod";

const completionSchemaWithoutMissionId = missionCompletionInputSchema
  .omit({ missionId: true })
  .partial()
  .refine(
    data => {
      if (!data || Object.keys(data).length === 0) return true;
      if (data.title || data.description) {
        return !!(data.title && data.description);
      }
      return true;
    },
    {
      message: "제목과 설명을 모두 입력하거나 모두 비워주세요.",
    },
  );

const baseSchema = missionInputSchema.extend({
  completion: completionSchemaWithoutMissionId.optional(),
});

export const createMissionFunnelSchema = baseSchema;

export type CreateMissionFunnelFormData = z.input<typeof createMissionFunnelSchema>;

export { MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH, MISSION_COMPLETION_TITLE_MAX_LENGTH };
