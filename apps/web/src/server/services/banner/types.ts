import type { Prisma } from "@prisma/client";

export type CreateBannerInput = Pick<
  Prisma.BannerUncheckedCreateInput,
  "title" | "subtitle" | "imageUrl" | "imageFileUploadId"
>;

export type UpdateBannerInput = Partial<CreateBannerInput>;
