import type { SortOrderType } from "@/types/common/sort";

export interface CreateSurveyInput {
  title: string;
  description?: string | null;
  target?: string | null;
  imageUrl?: string | null;
  deadline?: Date;
  estimatedMinutes?: number;
  questionIds: string[];
}

export interface UpdateSurveyInput {
  title?: string;
  description?: string;
  target?: string;
  imageUrl?: string;
  deadline?: Date;
  estimatedMinutes?: number;
}

export interface GetUserSurveysOptions {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
}

export interface SurveyCreatedResult {
  id: string;
  title: string;
  description: string | null;
  target: string | null;
  imageUrl: string | null;
  deadline: Date | null;
  estimatedMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
}
