import type { Action, ActionType, User } from "@prisma/client";

export interface SubmissionUser {
  name: string;
  phone: string | null;
}

export interface SubmissionAnswer {
  actionId: string;
  value: string | null;
}

export interface SubmissionRow {
  id: string;
  user: SubmissionUser;
  startedAt: Date;
  completedAt: Date | null;
  isCompleted: boolean;
  answers: SubmissionAnswer[];
}

export interface ColumnDef {
  id: string;
  title: string;
  type: ActionType;
}

export interface SubmissionTablesData {
  columns: ColumnDef[];
  allRows: SubmissionRow[];
  completedRows: SubmissionRow[];
  inProgressRows: SubmissionRow[];
}

export interface MissionResponseWithUserAndAnswers {
  id: string;
  startedAt: Date;
  completedAt: Date | null;
  user: Pick<User, "name" | "phone">;
  answers: Array<{
    actionId: string;
    textAnswer: string | null;
    scaleAnswer: number | null;
    booleanAnswer: boolean | null;
    dateAnswers: Date[];
    options: Array<{ title: string }>;
    fileUploads: Array<{ publicUrl: string | null }>;
  }>;
}

export interface BuildSubmissionTablesInput {
  actions: Action[];
  responses: MissionResponseWithUserAndAnswers[];
}
