import {
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
  titleSchema,
} from "@/schemas/mission/missionSchema";
import { rewardInputSchema } from "@/schemas/reward";
import { PaymentType } from "@prisma/client";
import { z } from "zod";

const createMissionFormRewardSchema = z.object({
  name: z
    .string()
    .min(1, "리워드 이름을 입력해주세요.")
    .max(100, "리워드 이름은 100자를 초과할 수 없습니다.")
    .trim(),
  description: z.string().max(500, "설명은 500자를 초과할 수 없습니다.").optional(),
  paymentType: z.enum(PaymentType, {
    message: "올바른 지급 유형을 선택해주세요.",
  }),
  scheduledDate: z.date().optional(),
});

const createMissionFormBaseSchema = z.object({
  title: titleSchema,
  description: z
    .string()
    .max(
      MISSION_DESCRIPTION_MAX_LENGTH,
      `설명은 ${MISSION_DESCRIPTION_MAX_LENGTH}자를 초과할 수 없습니다.`,
    )
    .optional(),
  hasReward: z.boolean(),
});

export const createMissionFormSchema = z.discriminatedUnion("hasReward", [
  createMissionFormBaseSchema.extend({
    hasReward: z.literal(false),
    reward: z.unknown().optional(),
  }),
  createMissionFormBaseSchema.extend({
    hasReward: z.literal(true),
    reward: createMissionFormRewardSchema,
  }),
]);

export type CreateMissionFormData = z.infer<typeof createMissionFormSchema>;

export { rewardInputSchema, MISSION_TITLE_MAX_LENGTH, MISSION_DESCRIPTION_MAX_LENGTH };
