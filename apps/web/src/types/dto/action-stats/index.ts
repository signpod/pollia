import type { ActionType } from "@prisma/client";

interface ActionStatBase {
  actionId: string;
  title: string;
  actionType: ActionType;
  totalResponses: number;
}

export interface ChoiceActionStats extends ActionStatBase {
  type: "choice";
  options: Array<{ label: string; count: number; percentage: number }>;
}

export interface ScaleActionStats extends ActionStatBase {
  type: "scale";
  distribution: Array<{ score: number; count: number }>;
  mean: number;
  median: number;
  min: number;
  max: number;
}

export interface TextActionStats extends ActionStatBase {
  type: "text";
  samples: string[];
  hasMore: boolean;
}

export interface CountOnlyActionStats extends ActionStatBase {
  type: "count";
}

export type ActionStatItem =
  | ChoiceActionStats
  | ScaleActionStats
  | TextActionStats
  | CountOnlyActionStats;

export interface GetActionStatsResponse {
  data: ActionStatItem[];
}
