import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { Client } from "@notionhq/client";
import type { Action, Mission } from "@prisma/client";

type FindByMissionIdResult = Awaited<ReturnType<MissionResponseRepository["findByMissionId"]>>;
export type MissionResponseWithAnswers = FindByMissionIdResult[number];
export type ActionAnswerWithRelations = MissionResponseWithAnswers["answers"][number];

export interface CreateMissionReportInput {
  mission: Mission;
  actions: Action[];
  responses: MissionResponseWithAnswers[];
}

export interface CreateMissionReportResult {
  notionPageId: string;
  notionPageUrl: string;
}

export type CreatePageParameters = Parameters<Client["pages"]["create"]>[0];

export type CreateDatabaseParameters = Parameters<Client["databases"]["create"]>[0];

export type DatabasePropertyConfigMap = NonNullable<CreateDatabaseParameters["properties"]>;

export type PagePropertyValueMap = NonNullable<CreatePageParameters["properties"]>;

export const MISSION_DATABASE_PROPERTY_NAMES = {
  MISSION_ID: "미션 ID",
  BRAND_LOGO: "브랜드 로고",
  DESCRIPTION: "설명",
  TARGET: "타겟",
  DEADLINE: "마감일",
  TOTAL_RESPONSES: "총 응답자",
  COMPLETED_RESPONSES: "완주자",
  COMPLETION_RATE: "완주율(%)",
  TYPE: "미션 타입",
  ESTIMATED_MINUTES: "예상 소요시간(분)",
  IS_ACTIVE: "활성 상태",
  LAST_SYNCED_AT: "마지막 동기화",
} as const;

export type MissionDatabasePropertyName =
  (typeof MISSION_DATABASE_PROPERTY_NAMES)[keyof typeof MISSION_DATABASE_PROPERTY_NAMES];
