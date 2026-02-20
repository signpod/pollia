import { z } from "zod";

export const nameSchema = z
  .string()
  .trim()
  .min(2, "닉네임은 2자 이상이어야 합니다.")
  .max(10, "닉네임은 10자를 초과할 수 없습니다.")
  .regex(/^[가-힣a-zA-Z]+$/, "한글, 영어만 입력 가능합니다.");

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
