import type { SortOrderType } from "@/types/common/sort";
import type { Mission, MissionCategory, MissionType, Prisma } from "@prisma/client";

type MissionCreateFields = Omit<
  Prisma.MissionUncheckedCreateInput,
  | "id"
  | "creatorId"
  | "createdAt"
  | "updatedAt"
  | "isActive"
  | "rewardId"
  | "password"
  | "quizConfig"
>;

export type CreateMissionInput = MissionCreateFields & {
  actionIds?: string[];
  quizConfig?: Record<string, unknown> | null;
};

export type UpdateMissionInput = Partial<MissionCreateFields> & {
  isActive?: boolean;
  rewardId?: string | null;
  quizConfig?: Record<string, unknown> | null;
};

export interface GetUserMissionsOptions {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
  category?: MissionCategory;
  type?: MissionType;
  isActive?: boolean;
}

export interface ListAllMissionsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: MissionCategory;
  visibility?: "PUBLIC" | "LINK_ONLY" | "PRIVATE";
  sortOrder?: SortOrderType;
}

export interface MissionWithParticipantInfo {
  mission: Mission;
  currentParticipants: number;
  maxParticipants: number | null;
  isClosed: boolean;
  isNotStarted: boolean;
  isDeadlinePassed: boolean;
  isParticipantLimitReached: boolean;
}

export interface MissionDuplicateResult
  extends Omit<
    Mission,
    | "imageFileUploadId"
    | "brandLogoUrl"
    | "isActive"
    | "maxParticipants"
    | "eventId"
    | "brandLogoFileUploadId"
    | "rewardId"
    | "password"
  > {}
