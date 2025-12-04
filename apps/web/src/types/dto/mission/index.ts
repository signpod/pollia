import type { Mission } from "@prisma/client";

export interface CreateMissionRequest {
  title: string;
  description?: string | null;
  target?: string | null;
  imageUrl?: string | null;
  brandLogoUrl?: string | null;
  deadline?: Date;
  estimatedMinutes?: number;
  isActive?: boolean;
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
    createdAt: Date;
    updatedAt: Date;
    creatorId: string;
  };
}

export interface GetMissionResponse {
  data: {
    id: string;
    title: string;
    description: string | null;
    target: string | null;
    imageUrl: string | null;
    brandLogoUrl: string | null;
    estimatedMinutes: number | null;
    deadline: Date | null;
    isActive: boolean;
    creatorId: string;
    rewardId: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface GetUserMissionsResponse {
  data: Pick<
    Mission,
    "id" | "title" | "description" | "target" | "imageUrl" | "isActive" | "createdAt" | "updatedAt"
  >[];
}

export interface UpdateMissionRequest {
  title?: string;
  description?: string | null;
  target?: string | null;
  imageUrl?: string | null;
  brandLogoUrl?: string | null;
  deadline?: Date;
  estimatedMinutes?: number;
  isActive?: boolean;
}

export interface UpdateMissionResponse {
  data: Mission;
}
