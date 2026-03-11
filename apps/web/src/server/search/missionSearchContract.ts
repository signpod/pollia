import type { Mission, MissionCategory } from "@prisma/client";

export const missionSearchableAttributes = {
  P1: ["title"],
  P2: ["title", "choseong"],
  P3: ["title", "category", "description", "choseong"],
} as const;

export const missionCustomRanking = [
  "desc(isActive)",
  "desc(likesCount)",
  "desc(createdAt)",
] as const;

export const missionSearchConfig = {
  searchableAttributes: missionSearchableAttributes.P3,
  customRanking: missionCustomRanking,
  typoTolerance: true,
} as const;

type MissionRecordFields = Pick<
  Mission,
  | "id"
  | "title"
  | "choseong"
  | "description"
  | "category"
  | "isActive"
  | "likesCount"
  | "viewCount"
  | "createdAt"
>;

export interface MissionSearchRecord {
  objectID: string;
  title: string;
  choseong: string;
  description: string;
  category: MissionCategory;
  isActive: boolean;
  likesCount: number;
  viewCount: number;
  createdAt: string;
}

export function toMissionSearchRecord(mission: MissionRecordFields): MissionSearchRecord {
  return {
    objectID: mission.id,
    title: mission.title,
    choseong: mission.choseong,
    description: mission.description ?? "",
    category: mission.category,
    isActive: mission.isActive,
    likesCount: mission.likesCount,
    viewCount: mission.viewCount,
    createdAt: mission.createdAt.toISOString(),
  };
}
