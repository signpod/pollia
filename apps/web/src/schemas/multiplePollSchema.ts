import { z } from "zod";
import { PollCategory } from "@prisma/client";

const pollCategoryValues = Object.values(PollCategory) as [string, ...string[]];

// 투표 옵션 스키마
const pollOptionSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "항목 설명을 입력해주세요.").trim(),
  imageUrl: z.string().optional(),
  link: z.string().optional(),
  order: z.number(),
  fileUploadId: z.string().optional(),
});

export const multiplePollSchema = z
  .object({
    category: z.enum(pollCategoryValues).optional(),
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
        (val) => {
          if (!val || val === "") return true;
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "올바른 URL 형식이 아닙니다." }
      ),
    thumbnailFileUploadId: z.string().optional(),
    maxSelections: z.number().min(1, "선택 가능 개수는 최소 1개입니다."),
    isUnlimited: z.boolean().default(false),
    startDate: z.string().min(1, "시작 날짜를 설정해주세요."),
    startTime: z.string().min(1, "시작 시간을 설정해주세요."),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
    options: z
      .array(pollOptionSchema)
      .min(2, "최소 2개 이상의 항목이 필요합니다."),
  })
  .refine(
    (data) => {
      return data.category !== undefined;
    },
    {
      message: "카테고리를 선택해주세요.",
      path: ["category"],
    }
  )
  .refine(
    (data) => {
      const validOptions = data.options.filter((option) =>
        option.description.trim()
      );
      return validOptions.length >= 2;
    },
    {
      message: "최소 2개 이상의 유효한 항목이 필요합니다.",
      path: ["options"],
    }
  )
  .refine(
    (data) => {
      const validOptions = data.options.filter((option) =>
        option.description.trim()
      );
      return data.maxSelections <= validOptions.length;
    },
    {
      message: "선택 가능 개수는 유효한 항목 개수를 초과할 수 없습니다.",
      path: ["maxSelections"],
    }
  )
  .refine(
    (data) => {
      if (data.isUnlimited) return true;
      return !!data.endDate;
    },
    {
      message: "종료 날짜를 설정해주세요.",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (data.isUnlimited) return true;
      return !!data.endTime;
    },
    {
      message: "종료 시간을 설정해주세요.",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      if (data.isUnlimited || !data.endDate || !data.endTime) return true;
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`);
      return endDateTime > startDateTime;
    },
    {
      message: "종료 시간은 시작 시간보다 늦어야 합니다.",
      path: ["endTime"],
    }
  );

export type MultiplePollFormData = z.infer<typeof multiplePollSchema>;
export type PollOptionFormData = z.infer<typeof pollOptionSchema>;
