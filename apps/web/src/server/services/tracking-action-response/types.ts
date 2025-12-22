import type { Prisma } from "@prisma/client";

type TrackingActionResponseCreateFields = Pick<
  Prisma.TrackingActionResponseUncheckedCreateInput,
  "missionId" | "sessionId" | "userId" | "actionId" | "metadata"
>;

export type RecordActionResponseInput = TrackingActionResponseCreateFields;

export interface GetTrackingResponsesOptions {
  missionId?: string;
  sessionId?: string;
  userId?: string;
  actionId?: string;
}
