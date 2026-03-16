import type { Banner } from "@prisma/client";

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  order: number;
  imageFileUploadId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetBannersResponse {
  data: BannerItem[];
}

export interface BannerResponse {
  data: Banner;
}
