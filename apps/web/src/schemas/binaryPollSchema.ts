import { PollCategory } from "@prisma/client";
import { z } from "zod";

const pollCategoryValues = Object.values(PollCategory) as [string, ...string[]];

export const binaryPollSchema = z
  .object({
    category: z.enum(pollCategoryValues),
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
    thumbnailUrl: z
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
    isUnlimited: z.boolean().default(false),
    startDate: z.string().min(1, "시작 날짜를 설정해주세요."),
    startTime: z.string().min(1, "시작 시간을 설정해주세요."),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
  })
  .refine(
    data => {
      return data.category !== undefined;
    },
    {
      message: "카테고리를 선택해주세요.",
      path: ["category"],
    },
  )
  .refine(
    data => {
      if (data.isUnlimited) return true;
      return !!data.endDate;
    },
    {
      message: "종료 날짜를 설정해주세요.",
      path: ["endDate"],
    },
  )
  .refine(
    data => {
      if (data.isUnlimited) return true;
      return !!data.endTime;
    },
    {
      message: "종료 시간을 설정해주세요.",
      path: ["endTime"],
    },
  )
  .refine(
    data => {
      if (data.isUnlimited || !data.endDate || !data.endTime) return true;
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`);
      return endDateTime > startDateTime;
    },
    {
      message: "종료 시간은 시작 시간보다 늦어야 합니다.",
      path: ["endTime"],
    },
  );

export type BinaryPollFormData = z.infer<typeof binaryPollSchema>;
