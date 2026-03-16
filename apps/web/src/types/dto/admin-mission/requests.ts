import type { SortOrderType } from "@/types/common/sort";
import type { MissionCategory } from "@prisma/client";

export interface GetAdminMissionsRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: MissionCategory;
  visibility?: "PUBLIC" | "LINK_ONLY" | "PRIVATE";
  sortOrder?: SortOrderType;
}
