import type { Mission, MissionType } from "@prisma/client";

export interface CreateMissionRequest {
  title: string;
  description?: string;
  target?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  brandLogoUrl?: string;
  brandLogoFileUploadId?: string;
  deadline?: Date;
  estimatedMinutes?: number;
  maxParticipants?: number | null;
  type: MissionType;
  isActive?: boolean;
  actionIds?: string[];
}

export interface CreateMissionResponse {
  data: {
    id: string;
    title: string;
    description?: string | null;
    target?: string | null;
    imageUrl?: string | null;
    brandLogoUrl?: string | null;
    deadline?: Date | null;
    estimatedMinutes?: number | null;
    type: MissionType;
    createdAt: Date;
    updatedAt: Date;
    creatorId: string;
  };
}

export interface GetMissionResponse {
  data: {
    id: string;
    title: string;
    description?: string | null;
    target?: string | null;
    imageUrl?: string | null;
    brandLogoUrl?: string | null;
    estimatedMinutes?: number | null;
    deadline?: Date | null;
    maxParticipants?: number | null;
    isActive: boolean;
    type: MissionType;
    password?: string | null;
    creatorId: string;
    rewardId?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface GetUserMissionsResponse {
  data: Pick<
    Mission,
    | "id"
    | "title"
    | "description"
    | "target"
    | "imageUrl"
    | "isActive"
    | "type"
    | "createdAt"
    | "updatedAt"
  >[];
}

export interface UpdateMissionRequest {
  title?: string;
  description?: string;
  target?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  brandLogoUrl?: string;
  brandLogoFileUploadId?: string;
  deadline?: Date;
  estimatedMinutes?: number;
  type?: MissionType;
  isActive?: boolean;
}

export interface UpdateMissionResponse {
  data: Mission;
}

export interface DuplicateMissionRequest {
  missionId: string;
}

export interface DuplicateMissionResponse {
  data: {
    id: string;
    title: string;
  };
}

export interface GetMissionParticipantInfoResponse {
  data: {
    currentParticipants: number;
    maxParticipants: number | null;
    isClosed: boolean;
  };
}
