import { Client } from "@notionhq/client";
import type { Action, ActionType, Mission, MissionResponse } from "@prisma/client";

export interface MissionResponseWithAnswers extends MissionResponse {
  answers: ActionAnswerWithRelations[];
}

export interface ActionAnswerWithRelations {
  id: string;
  actionId: string;
  textAnswer: string | null;
  scaleAnswer: number | null;
  booleanAnswer: boolean | null;
  dateAnswers: Date[];
  action: Action;
  option: {
    id: string;
    title: string;
  } | null;
  fileUploads: {
    id: string;
    url: string;
    filename: string;
  }[];
}

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
