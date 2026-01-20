import type { Mission, MissionType } from "@prisma/client";

export interface CreateMissionRequest
  extends Omit<Mission, "id" | "createdAt" | "updatedAt" | "creatorId" | "password" | "rewardId"> {
  actionIds?: string[];
}

export interface CreateMissionResponse {
  data: Mission;
}

export interface GetMissionResponse {
  data: Mission;
}

export interface GetUserMissionsResponse {
  data: Mission[];
}

export interface UpdateMissionRequest {
  title?: string;
  description?: string | null;
  target?: string | null;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
  brandLogoUrl?: string | null;
  brandLogoFileUploadId?: string | null;
  deadline?: Date;
  estimatedMinutes?: number;
  type?: MissionType;
  isActive?: boolean;
  eventId?: string | null;
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

export interface GetMissionNotionPageResponse {
  data: {
    notionPageId: string;
    notionPageUrl: string;
    lastSyncedAt: Date;
    syncedResponseCount: number;
  } | null;
}

export interface SyncMissionToNotionResponse {
  data: {
    notionPageUrl: string;
    syncedResponseCount: number;
  };
}
