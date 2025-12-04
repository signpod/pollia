import { z } from "zod";

const titleSchema = z
  .string()
  .min(1, "제목을 입력해주세요.")
  .max(30, "제목은 30자를 초과할 수 없습니다.")
  .trim();

const descriptionSchema = z.string().max(100, "설명은 100자를 초과할 수 없습니다.").optional();

const targetSchema = z.string().max(50, "대상은 50자를 초과할 수 없습니다.").optional();

const imageUrlSchema = z.url({ message: "올바른 URL 형식이 아닙니다." }).optional();
const imageFileUploadIdSchema = z.string().optional();

const brandLogoUrlSchema = z.url({ message: "올바른 URL 형식이 아닙니다." }).optional();
const brandLogoFileUploadIdSchema = z.string().optional();

const deadlineSchema = z.date().optional();

const estimatedMinutesSchema = z
  .number()
  .int("예상 소요 시간은 정수여야 합니다.")
  .positive("예상 소요 시간은 양수여야 합니다.")
  .max(120, "예상 소요 시간은 120분을 초과할 수 없습니다.")
  .optional();

const actionIdsSchema = z.array(z.string().min(1, "액션 ID가 비어있습니다.")).default([]);

export const missionInputSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  target: targetSchema,
  imageUrl: imageUrlSchema,
  imageFileUploadId: imageFileUploadIdSchema,
  brandLogoUrl: brandLogoUrlSchema,
  brandLogoFileUploadId: brandLogoFileUploadIdSchema,
  deadline: deadlineSchema,
  estimatedMinutes: estimatedMinutesSchema,
  actionIds: actionIdsSchema,
  isActive: z.boolean().optional(),
});

export const missionUpdateSchema = z
  .object({
    title: titleSchema.optional(),
    description: z.string().max(100, "설명은 100자를 초과할 수 없습니다.").optional(),
    target: z.string().max(50, "대상은 50자를 초과할 수 없습니다.").optional(),
    imageUrl: z.url({ message: "올바른 URL 형식이 아닙니다." }).optional(),
    imageFileUploadId: imageFileUploadIdSchema,
    brandLogoUrl: z.url({ message: "올바른 URL 형식이 아닙니다." }).optional(),
    brandLogoFileUploadId: brandLogoFileUploadIdSchema,
    deadline: z.date().optional(),
    estimatedMinutes: estimatedMinutesSchema,
    isActive: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

export type MissionInput = z.infer<typeof missionInputSchema>;
export type MissionUpdate = z.infer<typeof missionUpdateSchema>;
