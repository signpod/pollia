import { z } from "zod";
import { baseInfoSchema } from "../baseInfoSchema";

const surveyOptionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "항목 제목을 입력해주세요.").trim(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  order: z.number(),
  fileUploadId: z.string().optional(),
});

export const multipleChoiceInfoSchema = baseInfoSchema
  .extend({
    maxSelections: z.number().min(1, "선택 가능 개수는 최소 1개입니다."),
    options: z.array(surveyOptionSchema).min(2, "최소 2개 이상의 항목이 필요합니다."),
  })
  .refine(
    data => {
      const validOptions = data.options.filter(option => option.title.trim());
      return validOptions.length >= 2;
    },
    {
      message: "최소 2개 이상의 유효한 항목이 필요합니다.",
      path: ["options"],
    },
  )
  .refine(
    data => {
      const validOptions = data.options.filter(option => option.title.trim());
      return data.maxSelections <= validOptions.length;
    },
    {
      message: "선택 가능 개수는 유효한 항목 개수를 초과할 수 없습니다.",
      path: ["maxSelections"],
    },
  );

export type MultipleChoiceInfoFormData = z.infer<typeof multipleChoiceInfoSchema>;
export type SurveyOptionFormData = z.infer<typeof surveyOptionSchema>;
