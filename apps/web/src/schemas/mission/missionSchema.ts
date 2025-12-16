import { MissionType } from "@prisma/client";
import { z } from "zod";

const missionTypeSchema = z.enum(MissionType);

const titleSchema = z
  .string()
  .min(1, "제목을 입력해주세요.")
  .max(100, "제목은 100자를 초과할 수 없습니다.")
  .trim();

const descriptionSchema = z.string().max(500, "설명은 500자를 초과할 수 없습니다.").optional();

const targetSchema = z.string().max(100, "대상은 100자를 초과할 수 없습니다.").optional();

const imageUrlSchema = z.url({ message: "올바른 URL 형식이 아닙니다." }).optional();
const imageFileUploadIdSchema = z.string().optional();

const brandLogoUrlSchema = z.url({ message: "올바른 URL 형식이 아닙니다." }).optional();
const brandLogoFileUploadIdSchema = z.string().optional();

const deadlineSchema = z.date().optional();

const estimatedMinutesSchema = z
  .number()
  .int("정수여야 합니다")
  .min(1, "1 이상이어야 합니다")
  .max(120, "120 이하여야 합니다")
  .optional();

const actionIdsSchema = z.array(z.string().min(1, "액션 ID가 비어있습니다.")).default([]);

const passwordSchema = z
  .string()
  .min(4, "비밀번호는 최소 4자 이상이어야 합니다.")
  .max(20, "비밀번호는 20자를 초과할 수 없습니다.");

export const missionPasswordSchema = z.object({
  password: passwordSchema,
});

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
  type: missionTypeSchema,
  actionIds: actionIdsSchema,
  isActive: z.boolean().optional(),
});

export const missionUpdateSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    target: targetSchema,
    imageUrl: imageUrlSchema,
    imageFileUploadId: imageFileUploadIdSchema,
    brandLogoUrl: brandLogoUrlSchema,
    brandLogoFileUploadId: brandLogoFileUploadIdSchema,
    deadline: z.date().optional(),
    estimatedMinutes: estimatedMinutesSchema,
    type: missionTypeSchema.optional(),
    isActive: z.boolean().optional(),
    rewardId: z.string().nullable().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

export type MissionInput = z.infer<typeof missionInputSchema>;
export type MissionUpdate = z.infer<typeof missionUpdateSchema>;
export type MissionPasswordInput = z.infer<typeof missionPasswordSchema>;
