import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { Client } from "@notionhq/client";
import type { Action, ActionType, Mission } from "@prisma/client";

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

export type BlockObjectRequest = NonNullable<
  Parameters<Client["blocks"]["children"]["append"]>[0]["children"]
>[number];

export type CreatePageParameters = Parameters<Client["pages"]["create"]>[0];

export type CreateDatabaseParameters = Parameters<Client["databases"]["create"]>[0];

export type DatabasePropertyConfigMap = NonNullable<CreateDatabaseParameters["properties"]>;

export type PagePropertyValueMap = NonNullable<CreatePageParameters["properties"]>;

export const AGGREGATABLE_ACTION_TYPES: ActionType[] = [
  "MULTIPLE_CHOICE",
  "SCALE",
  "RATING",
  "TAG",
];

export const LISTABLE_ACTION_TYPES: ActionType[] = [
  "IMAGE",
  "VIDEO",
  "PDF",
  "SUBJECTIVE",
  "SHORT_TEXT",
];

export const EXCLUDED_ACTION_TYPES: ActionType[] = ["DATE", "TIME", "PRIVACY_CONSENT"];

export const MISSION_DATABASE_PROPERTY_NAMES = {
  TITLE: "미션 제목",
  MISSION_ID: "미션 ID",
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
