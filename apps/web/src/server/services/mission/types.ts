import type { SortOrderType } from "@/types/common/sort";
import type { Mission, MissionCategory, MissionType, Prisma } from "@prisma/client";

type MissionCreateFields = Omit<
  Prisma.MissionUncheckedCreateInput,
  "id" | "creatorId" | "createdAt" | "updatedAt" | "isActive" | "rewardId" | "password"
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
  category?: MissionCategory;
  type?: MissionType;
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
