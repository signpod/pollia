import type { SortOrderType } from "@/types/common/sort";
import type { Prisma, UserStatus } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface CreateUserIfNotExistsInput {
  user: SupabaseUser;
  name?: string;
  phone?: string;
  email: string;
}

export type CreateUserData = Prisma.UserCreateInput;

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  profileImageFileUploadId?: string | null;
}

export interface ListUsersOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortOrder?: SortOrderType;
  status?: UserStatus;
}
