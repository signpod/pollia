import { MissionType } from "@prisma/client";
import { z } from "zod";

export const MISSION_TITLE_MAX_LENGTH = 100;
export const MISSION_DESCRIPTION_MAX_LENGTH = 500;
export const MISSION_TARGET_MAX_LENGTH = 100;

const missionTypeSchema = z.enum(MissionType);

export const titleSchema = z
  .string()
  .min(1, "제목을 입력해주세요.")
  .max(MISSION_TITLE_MAX_LENGTH, `제목은 ${MISSION_TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`)
  .trim();

const descriptionSchema = z
  .string()
  .max(
    MISSION_DESCRIPTION_MAX_LENGTH,
    `설명은 ${MISSION_DESCRIPTION_MAX_LENGTH}자를 초과할 수 없습니다.`,
  )
  .optional();

const targetSchema = z
  .string()
  .max(MISSION_TARGET_MAX_LENGTH, `대상은 ${MISSION_TARGET_MAX_LENGTH}자를 초과할 수 없습니다.`)
  .optional();

const imageUrlSchema = z.url({ message: "올바른 URL 형식이 아닙니다." }).nullable().optional();
const imageFileUploadIdSchema = z.string().nullable().optional();

const brandLogoUrlSchema = z.url({ message: "올바른 URL 형식이 아닙니다." }).nullable().optional();
const brandLogoFileUploadIdSchema = z.string().nullable().optional();

const deadlineSchema = z.date().optional();

const estimatedMinutesSchema = z
  .number()
  .int("정수여야 합니다")
  .min(1, "1 이상이어야 합니다")
  .max(120, "120 이하여야 합니다")
  .optional();

const maxParticipantsSchema = z
  .number()
  .int("정수여야 합니다")
  .min(1, "1 이상이어야 합니다")
  .nullable()
  .optional()
  .default(null);

const actionIdsSchema = z.array(z.string().min(1, "액션 ID가 비어있습니다.")).default([]);

const passwordSchema = z
  .string()
  .length(6, "비밀번호는 정확히 6자리여야 합니다.")
  .regex(/^\d{6}$/, "비밀번호는 6자리 숫자만 가능합니다.");

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
  maxParticipants: maxParticipantsSchema,
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
    maxParticipants: maxParticipantsSchema,
    type: missionTypeSchema.optional(),
    isActive: z.boolean().optional(),
    rewardId: z.string().nullable().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

export type MissionInput = z.infer<typeof missionInputSchema>;
export type MissionUpdate = z.input<typeof missionUpdateSchema>;
export type MissionPasswordInput = z.infer<typeof missionPasswordSchema>;
