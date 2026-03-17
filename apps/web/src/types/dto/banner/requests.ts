export interface CreateBannerRequest {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  imageFileUploadId?: string | null;
  linkUrl?: string | null;
}

export interface UpdateBannerRequest {
  title?: string;
  subtitle?: string | null;
  imageUrl?: string;
  imageFileUploadId?: string | null;
  linkUrl?: string | null;
}

export interface ReorderBannersRequest {
  orders: Array<{ id: string; order: number }>;
}
