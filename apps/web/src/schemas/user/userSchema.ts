import { z } from "zod";

const nameSchema = z
  .string()
  .min(1, "이름을 입력해주세요.")
  .max(50, "이름은 50자를 초과할 수 없습니다.")
  .trim();

const phoneSchema = z.string().optional();

const emailSchema = z.email("올바른 이메일 형식이 아닙니다.");

const profileImageFileUploadIdSchema = z.string().optional().nullable();

export const userInputSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  phone: phoneSchema,
  profileImageFileUploadId: profileImageFileUploadIdSchema,
});

export const userUpdateSchema = z
  .object({
    name: nameSchema.optional(),
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

export type UserInput = z.infer<typeof userInputSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserWithdrawal = z.infer<typeof userWithdrawalSchema>;
