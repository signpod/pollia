import type { PaymentType } from "@prisma/client";

export interface CreateRewardInput {
  name: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  paymentType: PaymentType;
  scheduledDate?: Date;
}

export interface UpdateRewardInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  paymentType?: PaymentType;
  scheduledDate?: Date;
}
