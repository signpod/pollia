import { ActionType } from "@prisma/client";
import { z } from "zod";

const responseIdSchema = z.string().min(1, "응답 ID가 필요합니다.");

const actionIdSchema = z.string().min(1, "액션 ID가 필요합니다.");

const optionIdSchema = z.string().min(1, "선택지 ID가 필요합니다.");

const textAnswerSchema = z
  .string()
  .min(1, "주관식 답변은 필수입니다.")
  .max(100, "주관식 답변은 100자를 초과할 수 없습니다.")
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

export const actionAnswerInputSchema = z.object({
  responseId: responseIdSchema,
  actionId: actionIdSchema,
  optionId: optionIdSchema.optional(),
  textAnswer: textAnswerSchema.optional(),
  scaleAnswer: scaleAnswerSchema.optional(),
  fileUploadIds: fileUploadIdsSchema,
  dateAnswers: dateAnswersSchema,
});

export const submitAnswerItemSchema = z
  .object({
    actionId: actionIdSchema,
    type: actionTypeSchema,
    isRequired: z.boolean(),
    selectedOptionIds: z.array(optionIdSchema).optional(),
    scaleValue: scaleAnswerSchema.optional(),
    textAnswer: textAnswerSchema.optional(),
    fileUploadIds: fileUploadIdsSchema,
    dateAnswers: dateAnswersSchema,
  })
  .refine(
    data => {
      if (data.type === ActionType.MULTIPLE_CHOICE && data.isRequired) {
        return data.selectedOptionIds && data.selectedOptionIds.length > 0;
      }
      return true;
    },
    { message: "최소 1개 이상의 선택지를 선택해주세요." },
  )
  .refine(
    data => {
      if (data.type === ActionType.TAG && data.isRequired) {
        return data.selectedOptionIds && data.selectedOptionIds.length > 0;
      }
      return true;
    },
    { message: "최소 1개 이상의 태그를 선택해주세요." },
  )
  .refine(
    data => {
      if (data.type === ActionType.SCALE && data.isRequired) {
        return data.scaleValue !== undefined;
      }
      return true;
    },
    { message: "척도 값을 선택해주세요." },
  )
  .refine(
    data => {
      if (data.type === ActionType.RATING && data.isRequired) {
        return data.scaleValue !== undefined;
      }
      return true;
    },
    { message: "별점 값을 선택해주세요." },
  )
  .refine(
    data => {
      if (data.type === ActionType.SUBJECTIVE && data.isRequired) {
        return data.textAnswer && data.textAnswer.trim().length > 0;
      }
      return true;
    },
    { message: "주관식 답변은 필수입니다." },
  )
  .refine(
    data => {
      if (data.type === ActionType.IMAGE && data.isRequired) {
        return data.fileUploadIds && data.fileUploadIds.length > 0;
      }
      return true;
    },
    { message: "이미지는 필수입니다." },
  )
  .refine(
    data => {
      if (data.type === ActionType.PDF && data.isRequired) {
        return data.fileUploadIds && data.fileUploadIds.length > 0;
      }
      return true;
    },
    { message: "PDF 파일은 필수입니다." },
  )
  .refine(
    data => {
      if (data.type === ActionType.VIDEO && data.isRequired) {
        return data.fileUploadIds && data.fileUploadIds.length > 0;
      }
      return true;
    },
    { message: "동영상 파일은 필수입니다." },
  )
  .refine(
    data => {
      if (data.type === ActionType.DATE && data.isRequired) {
        return data.dateAnswers && data.dateAnswers.length > 0;
      }
      return true;
    },
    { message: "날짜를 선택해주세요." },
  )
  .refine(
    data => {
      if (data.type === ActionType.TIME && data.isRequired) {
        return data.dateAnswers && data.dateAnswers.length > 0;
      }
      return true;
    },
    { message: "시간을 선택해주세요." },
  );

export const submitAnswersSchema = z.object({
  responseId: responseIdSchema,
  answers: z.array(submitAnswerItemSchema).min(1, "최소 1개 이상의 답변이 필요합니다."),
});

export const actionAnswerUpdateSchema = z
  .object({
    optionId: optionIdSchema.optional(),
    textAnswer: textAnswerSchema.optional(),
    scaleAnswer: scaleAnswerSchema.optional(),
    dateAnswers: dateAnswersSchema,
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

export type ActionAnswerInput = z.infer<typeof actionAnswerInputSchema>;
export type SubmitAnswers = z.infer<typeof submitAnswersSchema>;
export type SubmitAnswerItem = z.infer<typeof submitAnswerItemSchema>;
export type ActionAnswerUpdate = z.infer<typeof actionAnswerUpdateSchema>;
