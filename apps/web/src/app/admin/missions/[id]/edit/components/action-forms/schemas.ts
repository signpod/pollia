import { z } from "zod";

const actionOptionFormSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const multipleChoiceFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "제목을 입력해주세요.")
      .max(30, "제목은 30자를 초과할 수 없습니다.")
      .trim(),
    description: z.string().max(500, "설명은 500자를 초과할 수 없습니다.").optional(),
    options: z.array(actionOptionFormSchema),
  })
  .refine(data => data.options.length >= 2, {
    message: "최소 2개 이상의 선택지가 필요합니다.",
    path: ["options"],
  })
  .refine(data => data.options.every(opt => opt.title.trim().length > 0), {
    message: "모든 선택지에 제목을 입력해주세요.",
    path: ["options"],
  });

export const scaleFormSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(30, "제목은 30자를 초과할 수 없습니다.")
    .trim(),
  description: z.string().max(500, "설명은 500자를 초과할 수 없습니다.").optional(),
});

export const subjectiveFormSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(30, "제목은 30자를 초과할 수 없습니다.")
    .trim(),
  description: z.string().max(500, "설명은 500자를 초과할 수 없습니다.").optional(),
});

export type MultipleChoiceFormInput = z.infer<typeof multipleChoiceFormSchema>;
export type ScaleFormInput = z.infer<typeof scaleFormSchema>;
export type SubjectiveFormInput = z.infer<typeof subjectiveFormSchema>;
