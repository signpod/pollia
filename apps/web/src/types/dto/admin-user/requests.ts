import type { SortOrderType } from "@/types/common/sort";
import type { UserStatus } from "@prisma/client";

export interface GetAdminUsersRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  sortOrder?: SortOrderType;
  status?: UserStatus;
}
