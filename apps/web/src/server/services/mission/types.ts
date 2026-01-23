import type { SortOrderType } from "@/types/common/sort";
import type { Mission, Prisma } from "@prisma/client";

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
  | "eventId"
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

export interface MissionWithParticipantInfo {
  currentParticipants: number;
  maxParticipants: number | null;
  isClosed: boolean;
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
