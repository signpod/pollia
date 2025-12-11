import type { SortOrderType } from "@/types/common/sort";

export interface CreateMissionInput {
  title: string;
  description?: string;
  target?: string;
  imageUrl?: string;
  deadline?: Date;
  estimatedMinutes?: number;
  actionIds?: string[];
}

export interface UpdateMissionInput {
  title?: string;
  description?: string;
  target?: string;
  imageUrl?: string;
  brandLogoUrl?: string;
  deadline?: Date;
  estimatedMinutes?: number;
  isActive?: boolean;
  rewardId?: string | null;
}

export interface GetUserMissionsOptions {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
}

export interface MissionCreatedResult {
  id: string;
  title: string;
  description: string | null;
  target: string | null;
  imageUrl: string | null;
  deadline: Date | null;
  estimatedMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
}
