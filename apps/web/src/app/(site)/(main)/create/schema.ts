import {
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
  titleSchema,
} from "@/schemas/mission/missionSchema";
import { rewardInputSchema } from "@/schemas/reward";
import { MissionCategory, PaymentType } from "@prisma/client";
import { z } from "zod";

const createMissionFormRewardSchema = z
  .object({
    name: z
      .string()
      .min(1, "리워드 이름을 입력해주세요.")
      .max(100, "리워드 이름은 100자를 초과할 수 없습니다.")
      .trim(),
    description: z.string().max(500, "설명은 500자를 초과할 수 없습니다.").optional(),
    imageUrl: z.string().nullable().optional(),
    imageFileUploadId: z.string().nullable().optional(),
    paymentType: z.enum(PaymentType, {
      message: "올바른 지급 유형을 선택해주세요.",
    }),
    scheduledDate: z.date().optional(),
  })
  .refine(data => !(data.paymentType === PaymentType.SCHEDULED && !data.scheduledDate), {
    message: "예약 지급의 경우 예약 일시는 필수입니다.",
    path: ["scheduledDate"],
  })
  .refine(
    data =>
      !(
        data.paymentType === PaymentType.SCHEDULED &&
        data.scheduledDate &&
        data.scheduledDate <= new Date()
      ),
    {
      message: "예약 일시는 현재 시간보다 이후여야 합니다.",
      path: ["scheduledDate"],
    },
  );

const createMissionFormBaseSchema = z.object({
  category: z
    .enum(MissionCategory)
    .nullable()
    .refine(value => value !== null, {
      message: "카테고리를 선택해주세요.",
    }),
  creationMode: z
    .enum(["custom", "template"])
    .nullable()
    .refine(value => value !== null, {
      message: "생성 방식을 선택해주세요.",
    }),
  title: titleSchema,
  description: z
    .string()
    .max(
      MISSION_DESCRIPTION_MAX_LENGTH,
      `설명은 ${MISSION_DESCRIPTION_MAX_LENGTH}자를 초과할 수 없습니다.`,
    )
    .optional(),
  isActive: z.boolean(),
  isExposed: z.boolean(),
  allowGuestResponse: z.boolean(),
  allowMultipleResponses: z.boolean(),
  useAiCompletion: z.boolean(),
  imageUrl: z.string().nullable().optional(),
  imageFileUploadId: z.string().nullable().optional(),
  brandLogoUrl: z.string().nullable().optional(),
  brandLogoFileUploadId: z.string().nullable().optional(),
  startDate: z.date().nullable(),
  deadline: z.date().nullable(),
  hasReward: z.boolean(),
});

const dateRangeRefine = (data: { startDate?: Date | null; deadline?: Date | null }) => {
  if (data.startDate && data.deadline) {
    return data.startDate <= data.deadline;
  }
  return true;
};

const dateRangeError = {
  message: "시작일은 만료일보다 이전이어야 합니다.",
  path: ["startDate"],
};

const createMissionFormWithoutReward = createMissionFormBaseSchema
  .extend({
    hasReward: z.literal(false),
    reward: z.unknown().optional(),
  })
  .refine(dateRangeRefine, dateRangeError);

const createMissionFormWithReward = createMissionFormBaseSchema
  .extend({
    hasReward: z.literal(true),
    reward: createMissionFormRewardSchema,
  })
  .refine(dateRangeRefine, dateRangeError);

export const createMissionFormSchema = z.discriminatedUnion("hasReward", [
  createMissionFormWithoutReward,
  createMissionFormWithReward,
]);

export type CreateMissionFormData = z.infer<typeof createMissionFormSchema>;

export type RewardFormValues = z.infer<typeof createMissionFormRewardSchema>;

export function isRewardFormValues(value: unknown): value is RewardFormValues {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "paymentType" in value &&
    typeof (value as RewardFormValues).name === "string"
  );
}

export { rewardInputSchema, MISSION_TITLE_MAX_LENGTH, MISSION_DESCRIPTION_MAX_LENGTH };
