import { ActionType } from "@prisma/client";
import { z } from "zod";

export const TEXT_ANSWER_MAX_LENGTH = 500;
export const SHORT_TEXT_ANSWER_MAX_LENGTH = 50;

const responseIdSchema = z.string().min(1, "응답 ID가 필요합니다.");

const actionIdSchema = z.string().min(1, "액션 ID가 필요합니다.");

const optionIdSchema = z.string().min(1, "선택지 ID가 필요합니다.");

const textAnswerSchema = z
  .string()
  .min(1, "답변은 필수입니다.")
  .max(TEXT_ANSWER_MAX_LENGTH, `답변은 ${TEXT_ANSWER_MAX_LENGTH}자를 초과할 수 없습니다.`)
  .trim();

const shortTextAnswerSchema = z
  .string()
  .min(1, "답변은 필수입니다.")
  .max(
    SHORT_TEXT_ANSWER_MAX_LENGTH,
    `답변은 ${SHORT_TEXT_ANSWER_MAX_LENGTH}자를 초과할 수 없습니다.`,
  )
  .trim();

const scaleAnswerSchema = z
  .number("별점 값은 숫자여야 합니다.")
  .min(0, "별점 값은 0 이상이어야 합니다.")
  .max(10, "별점 값은 10 이하여야 합니다.");

const actionTypeSchema = z.enum(ActionType);

const fileUploadIdsSchema = z.array(z.string()).optional();

const dateAnswersSchema = z
  .array(z.coerce.date())
  .min(1, "최소 1개 이상의 날짜를 선택해주세요.")
  .optional();

export const baseAnswerInputSchema = z.object({
  responseId: responseIdSchema,
  actionId: actionIdSchema,
});

export const subjectiveAnswerInputSchema = baseAnswerInputSchema.extend({
  textAnswer: textAnswerSchema,
});

export const shortTextAnswerInputSchema = baseAnswerInputSchema.extend({
  textAnswer: shortTextAnswerSchema,
});

export const scaleAnswerInputSchema = baseAnswerInputSchema.extend({
  scaleAnswer: scaleAnswerSchema,
});

export const ratingAnswerInputSchema = baseAnswerInputSchema.extend({
  scaleAnswer: scaleAnswerSchema,
});

export const multipleChoiceAnswerInputSchema = baseAnswerInputSchema
  .extend({
    selectedOptionIds: z.array(optionIdSchema).optional(),
    textAnswer: z.string().optional(),
  })
  .refine(
    data => (data.selectedOptionIds && data.selectedOptionIds.length > 0) || data.textAnswer,
    {
      message: "선택지를 선택하거나 기타 의견을 입력해주세요.",
    },
  );

export const tagAnswerInputSchema = baseAnswerInputSchema
  .extend({
    selectedOptionIds: z.array(optionIdSchema).optional(),
    textAnswer: z.string().optional(),
  })
  .refine(
    data => (data.selectedOptionIds && data.selectedOptionIds.length > 0) || data.textAnswer,
    {
      message: "선택지를 선택하거나 기타 의견을 입력해주세요.",
    },
  );

export const imageAnswerInputSchema = baseAnswerInputSchema.extend({
  fileUploadIds: z.array(z.string()).min(1, "최소 1개 이상의 이미지를 업로드해주세요."),
});

export const pdfAnswerInputSchema = baseAnswerInputSchema.extend({
  fileUploadIds: z.array(z.string()).min(1, "최소 1개 이상의 PDF를 업로드해주세요."),
});

export const videoAnswerInputSchema = baseAnswerInputSchema.extend({
  fileUploadIds: z.array(z.string()).min(1, "최소 1개 이상의 비디오를 업로드해주세요."),
});

export const dateAnswerInputSchema = baseAnswerInputSchema.extend({
  dateAnswers: z.array(z.coerce.date()).min(1, "최소 1개 이상의 날짜를 선택해주세요."),
});

export const timeAnswerInputSchema = baseAnswerInputSchema.extend({
  dateAnswers: z.array(z.coerce.date()).min(1, "최소 1개 이상의 시간을 선택해주세요."),
});

export const submitAnswerItemSchema = z.object({
  actionId: actionIdSchema,
  type: actionTypeSchema,
  isRequired: z.boolean(),
  selectedOptionIds: z.array(optionIdSchema).optional(),
  scaleValue: scaleAnswerSchema.optional(),
  textAnswer: z.string().optional(),
  fileUploadIds: fileUploadIdsSchema,
  dateAnswers: dateAnswersSchema,
});

export const submitAnswersSchema = z.object({
  responseId: responseIdSchema,
  answers: z.array(submitAnswerItemSchema).min(1, "최소 1개 이상의 답변이 필요합니다."),
});

export const actionAnswerUpdateSchema = z
  .object({
    selectedOptionIds: z.array(optionIdSchema).optional(),
    textAnswer: z.string().optional(),
    scaleAnswer: scaleAnswerSchema.optional(),
    dateAnswers: dateAnswersSchema,
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

export type SubmitAnswers = z.infer<typeof submitAnswersSchema>;
export type SubmitAnswerItem = z.infer<typeof submitAnswerItemSchema>;
export type ActionAnswerUpdate = z.infer<typeof actionAnswerUpdateSchema>;
