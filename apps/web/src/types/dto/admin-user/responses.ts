import type { UserRole, UserStatus } from "@prisma/client";

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

export interface GetAdminUsersResponse {
  data: AdminUserItem[];
  total: number;
}
