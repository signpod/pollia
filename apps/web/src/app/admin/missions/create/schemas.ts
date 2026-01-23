import { missionInputSchema } from "@/schemas/mission";
import {
  MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH,
  MISSION_COMPLETION_TITLE_MAX_LENGTH,
  missionCompletionInputSchema,
} from "@/schemas/mission-completion";
import { z } from "zod";

const completionSchemaWithoutMissionId = missionCompletionInputSchema.omit({ missionId: true });

const baseSchema = missionInputSchema.extend({
  completion: completionSchemaWithoutMissionId,
});

export const createMissionFunnelSchema = baseSchema;

export type CreateMissionFunnelFormData = z.input<typeof createMissionFunnelSchema>;

export { MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH, MISSION_COMPLETION_TITLE_MAX_LENGTH };
