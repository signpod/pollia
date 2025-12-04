import type { Mission } from "@/types/domain/mission";
// ============================================================================
// Mission Creation DTOs
// ============================================================================

export interface CreateMissionRequest {
  title: string;
  description?: string | null;
  target?: string | null;
  imageUrl?: string | null;
  questionIds: string[];
  deadline?: Date;
  estimatedMinutes?: number;
}

export interface CreateMissionResponse {
  data: {
    id: string;
    title: string;
    description?: string | null;
    target?: string | null;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
    creatorId: string;
    deadline?: Date | null;
    estimatedMinutes?: number | null;
  };
}

// ============================================================================
// Mission Read DTOs
// ============================================================================

export interface GetUserMissionsResponse {
  data: Pick<
    Mission,
    "id" | "title" | "description" | "target" | "imageUrl" | "isActive" | "createdAt" | "updatedAt"
  >[];
}

// Mission 조회 응답 타입
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
