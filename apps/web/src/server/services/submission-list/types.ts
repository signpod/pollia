import type { Action, ActionType, User } from "@prisma/client";

export interface SubmissionUser {
  name: string;
  phone: string | null;
  guestId: string | null;
}

export interface SubmissionAnswer {
  actionId: string;
  value: string | null;
}

export interface SubmissionRow {
  id: string;
  respondentId: string;
  user: SubmissionUser;
  startedAt: Date;
  completedAt: Date | null;
  responseAt: Date;
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
  userId: string | null;
  guestId: string | null;
  user: Pick<User, "name" | "phone"> | null;
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
