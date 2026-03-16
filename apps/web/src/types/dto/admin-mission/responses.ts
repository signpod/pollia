import type { MissionCategory, MissionType } from "@prisma/client";

export interface AdminMissionItem {
  id: string;
  title: string;
  category: MissionCategory;
  isActive: boolean;
  type: MissionType;
  createdAt: Date;
  creator: { id: string; name: string };
}

export interface GetAdminMissionsResponse {
  data: AdminMissionItem[];
  total: number;
}
