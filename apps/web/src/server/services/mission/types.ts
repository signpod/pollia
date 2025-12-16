import type { SortOrderType } from "@/types/common/sort";
import type { MissionType, Prisma } from "@prisma/client";

type MissionCreateFields = Pick<
  Prisma.MissionUncheckedCreateInput,
  | "title"
  | "description"
  | "target"
  | "imageUrl"
  | "imageFileUploadId"
  | "brandLogoUrl"
  | "brandLogoFileUploadId"
  | "deadline"
  | "estimatedMinutes"
  | "maxParticipants"
  | "type"
>;

export type CreateMissionInput = MissionCreateFields & {
  actionIds?: string[];
};

export type UpdateMissionInput = Partial<MissionCreateFields> & {
  isActive?: boolean;
  rewardId?: string | null;
};

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
  type: MissionType;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
}

export interface MissionWithParticipantInfo {
  currentParticipants: number;
  maxParticipants: number | null;
  isClosed: boolean;
}
