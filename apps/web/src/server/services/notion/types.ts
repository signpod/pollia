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
