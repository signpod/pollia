import {
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
  titleSchema,
} from "@/schemas/mission/missionSchema";
import { PaymentType } from "@prisma/client";
import { z } from "zod";

const quizConfigFormSchema = z.object({
  gradingMode: z.enum(["instant", "final"]),
  showExplanation: z.boolean(),
  showCorrectOnWrong: z.boolean(),
  shuffleQuestions: z.boolean(),
  shuffleChoices: z.boolean(),
});

const quizMissionFormRewardSchema = z
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

const quizMissionFormBaseSchema = z.object({
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
  imageUrl: z.string().nullable().optional(),
  imageFileUploadId: z.string().nullable().optional(),
  brandLogoUrl: z.string().nullable().optional(),
  brandLogoFileUploadId: z.string().nullable().optional(),
  startDate: z.date().nullable(),
  deadline: z.date().nullable(),
  hasReward: z.boolean(),
  quizConfig: quizConfigFormSchema,
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

const quizMissionFormWithoutReward = quizMissionFormBaseSchema
  .extend({
    hasReward: z.literal(false),
    reward: z.unknown().optional(),
  })
  .refine(dateRangeRefine, dateRangeError);

const quizMissionFormWithReward = quizMissionFormBaseSchema
  .extend({
    hasReward: z.literal(true),
    reward: quizMissionFormRewardSchema,
  })
  .refine(dateRangeRefine, dateRangeError);

export const createQuizMissionFormSchema = z.discriminatedUnion("hasReward", [
  quizMissionFormWithoutReward,
  quizMissionFormWithReward,
]);

export type CreateQuizMissionFormData = z.infer<typeof createQuizMissionFormSchema>;

export { MISSION_TITLE_MAX_LENGTH, MISSION_DESCRIPTION_MAX_LENGTH };
