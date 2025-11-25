import { SurveyQuestionType } from "@prisma/client";
import { z } from "zod";

const responseIdSchema = z.string().min(1, "응답 ID가 필요합니다.");

const questionIdSchema = z.string().min(1, "질문 ID가 필요합니다.");

const optionIdSchema = z.string().min(1, "선택지 ID가 필요합니다.");

const textAnswerSchema = z
  .string()
  .min(1, "주관식 답변은 필수입니다.")
  .max(100, "주관식 답변은 100자를 초과할 수 없습니다.")
  .trim();

const scaleAnswerSchema = z
  .number()
  .int("척도 값은 정수여야 합니다.")
  .min(1, "척도 값은 1~5 사이여야 합니다.")
  .max(5, "척도 값은 1~5 사이여야 합니다.");

const questionTypeSchema = z.enum(SurveyQuestionType);

export const questionAnswerInputSchema = z.object({
  responseId: responseIdSchema,
  questionId: questionIdSchema,
  optionId: optionIdSchema.optional(),
  textAnswer: textAnswerSchema.optional(),
  scaleAnswer: scaleAnswerSchema.optional(),
});

const submitAnswerItemSchema = z
  .object({
    questionId: questionIdSchema,
    type: questionTypeSchema,
    selectedOptionIds: z.array(optionIdSchema).optional(),
    scaleValue: scaleAnswerSchema.optional(),
    textResponse: textAnswerSchema.optional(),
  })
  .refine(
    data => {
      if (data.type === SurveyQuestionType.MULTIPLE_CHOICE) {
        return data.selectedOptionIds && data.selectedOptionIds.length > 0;
      }
      return true;
    },
    { message: "최소 1개 이상의 선택지를 선택해주세요." },
  )
  .refine(
    data => {
      if (data.type === SurveyQuestionType.SCALE) {
        return data.scaleValue !== undefined;
      }
      return true;
    },
    { message: "척도 값을 선택해주세요." },
  )
  .refine(
    data => {
      if (data.type === SurveyQuestionType.SUBJECTIVE) {
        return data.textResponse && data.textResponse.trim().length > 0;
      }
      return true;
    },
    { message: "주관식 답변은 필수입니다." },
  );

export const submitAnswersSchema = z.object({
  responseId: responseIdSchema,
  answers: z.array(submitAnswerItemSchema).min(1, "최소 1개 이상의 답변이 필요합니다."),
});

export const questionAnswerUpdateSchema = z
  .object({
    optionId: optionIdSchema.optional(),
    textAnswer: textAnswerSchema.optional(),
    scaleAnswer: scaleAnswerSchema.optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

export type QuestionAnswerInput = z.infer<typeof questionAnswerInputSchema>;
export type SubmitAnswers = z.infer<typeof submitAnswersSchema>;
export type SubmitAnswerItem = z.infer<typeof submitAnswerItemSchema>;
export type QuestionAnswerUpdate = z.infer<typeof questionAnswerUpdateSchema>;
