import { PaymentType } from "@prisma/client";
import { z } from "zod";

const nameSchema = z
  .string()
  .min(1, "Reward 이름을 입력해주세요.")
  .max(100, "Reward 이름은 100자를 초과할 수 없습니다.")
  .trim();

const descriptionSchema = z.string().max(500, "설명은 500자를 초과할 수 없습니다.").optional();

const imageUrlSchema = z.url({ message: "올바른 URL 형식이 아닙니다." }).optional();
const imageFileUploadIdSchema = z.string().optional();

const paymentTypeSchema = z.enum(PaymentType, {
  message: "올바른 지급 유형을 선택해주세요.",
});

const scheduledDateSchema = z.date().optional();
const paidAtSchema = z.date().optional().nullable();

export const rewardBaseSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  imageUrl: imageUrlSchema,
  imageFileUploadId: imageFileUploadIdSchema,
  paymentType: paymentTypeSchema,
  scheduledDate: scheduledDateSchema,
});

export const rewardInputSchema = rewardBaseSchema
  .refine(
    data => {
      if (data.paymentType === PaymentType.SCHEDULED && !data.scheduledDate) {
        return false;
      }
      return true;
    },
    { message: "예약 지급의 경우 예약 일시는 필수입니다." },
  )
  .refine(
    data => {
      if (data.paymentType === PaymentType.SCHEDULED && data.scheduledDate) {
        return data.scheduledDate > new Date();
      }
      return true;
    },
    { message: "예약 일시는 현재 시간보다 이후여야 합니다." },
  );

export const rewardUpdateSchema = rewardBaseSchema
  .extend({
    name: nameSchema.optional(),
    paymentType: paymentTypeSchema.optional(),
    paidAt: paidAtSchema,
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  })
  .refine(
    data => {
      if (data.paymentType === PaymentType.SCHEDULED && !data.scheduledDate) {
        return false;
      }
      return true;
    },
    { message: "예약 지급의 경우 예약 일시는 필수입니다." },
  )
  .refine(
    data => {
      if (data.paymentType === PaymentType.SCHEDULED && data.scheduledDate) {
        return data.scheduledDate > new Date();
      }
      return true;
    },
    { message: "예약 일시는 현재 시간보다 이후여야 합니다." },
  );

export type RewardInput = z.infer<typeof rewardInputSchema>;
export type RewardUpdate = z.infer<typeof rewardUpdateSchema>;
