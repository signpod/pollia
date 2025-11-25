import { z } from "zod";

export const baseInfoSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(30, "제목은 30자를 초과할 수 없습니다.")
    .trim(),
  description: z
    .string()
    .max(100, "설명은 100자를 초과할 수 없습니다.")
    .optional()
    .or(z.literal("")),
  imageUrl: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val || val === "") return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "올바른 URL 형식이 아닙니다." },
    ),
});

export type BaseInfoFormData = z.infer<typeof baseInfoSchema>;
