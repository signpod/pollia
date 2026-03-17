import type { Prisma } from "@prisma/client";

export type CreateBannerInput = Pick<
  Prisma.BannerUncheckedCreateInput,
  "title" | "subtitle" | "imageUrl" | "imageFileUploadId" | "linkUrl"
>;

export type UpdateBannerInput = Partial<CreateBannerInput>;
