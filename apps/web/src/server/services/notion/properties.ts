import type { Mission } from "@prisma/client";
import type { MissionResponseWithAnswers } from "./types";
import { stripHtmlTags, truncateText } from "./utils";

export interface MissionMetadata {
  brandLogoUrl?: string;
  description?: string;
  target?: string;
  deadline?: string;
  totalResponses: number;
  completedResponses: number;
  completionRate: number;
  type: string;
  estimatedMinutes?: number;
  isActive: boolean;
}

export function buildMissionMetadata(
  mission: Mission,
  responses: MissionResponseWithAnswers[],
): MissionMetadata {
  const totalResponses = responses.length;
  const completedResponses = responses.filter(r => r.completedAt !== null).length;
  const completionRate =
    totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

  return {
    brandLogoUrl: mission.brandLogoUrl ?? undefined,
    description: mission.description
      ? truncateText(stripHtmlTags(mission.description), 2000)
      : undefined,
    target: mission.target ?? undefined,
    deadline: mission.deadline?.toISOString().split("T")[0],
    totalResponses,
    completedResponses,
    completionRate,
    type: mission.type === "GENERAL" ? "일반" : "체험단",
    estimatedMinutes: mission.estimatedMinutes ?? undefined,
    isActive: mission.isActive,
  };
}
