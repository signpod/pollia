import { MAX_FILE_SIZE } from "@/constants/fileUpload";
import { ActionType } from "@prisma/client";
import { z } from "zod";

const PROFILE_IMAGE_MAX_SIZE = MAX_FILE_SIZE[ActionType.IMAGE];

export const profileImageSchema = z
  .instanceof(File)
  .refine(file => file.size <= PROFILE_IMAGE_MAX_SIZE, {
    message: "프로필 이미지는 5MB를 초과할 수 없습니다.",
  });

export const nicknameSchema = z
  .string()
  .trim()
  .regex(/^[가-힣a-zA-Z0-9]+$/, "띄어쓰기와 특수문자는 사용할 수 없어요")
  .min(2, "닉네임은 2자 이상이어야 해요")
  .max(20, "닉네임은 20자 이하여야 해요");

const phoneSchema = z.string().optional();

const emailSchema = z.email("올바른 이메일 형식이 아닙니다.");

const profileImageFileUploadIdSchema = z.string().optional().nullable();

export const userInputSchema = z.object({
  email: emailSchema,
  name: nicknameSchema,
  phone: phoneSchema,
  profileImageFileUploadId: profileImageFileUploadIdSchema,
});

export const userUpdateSchema = z
  .object({
    name: nicknameSchema.optional(),
    phone: phoneSchema,
    profileImageFileUploadId: profileImageFileUploadIdSchema,
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

export const userWithdrawalSchema = z.object({
  reason: z
    .string()
    .max(500, { error: "탈퇴 사유는 500자를 초과할 수 없습니다." })
    .trim()
    .optional(),
});

export const withdrawalFormSchema = z
  .object({
    reason: z.string().min(1, "탈퇴 사유를 선택해주세요."),
    customReason: z.string().optional(),
  })
  .refine(data => data.reason !== "other" || (data.customReason?.trim() ?? "").length > 0, {
    message: "탈퇴 사유를 입력해주세요.",
    path: ["customReason"],
  });

export type UserInput = z.infer<typeof userInputSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserWithdrawal = z.infer<typeof userWithdrawalSchema>;
export type WithdrawalForm = z.infer<typeof withdrawalFormSchema>;
