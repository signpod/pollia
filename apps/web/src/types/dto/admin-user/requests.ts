import type { SortOrderType } from "@/types/common/sort";

export interface GetAdminUsersRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  sortOrder?: SortOrderType;
}
