import type { Prisma } from "@prisma/client";

type TrackingActionEntryCreateFields = Pick<
  Prisma.TrackingActionEntryUncheckedCreateInput,
  "missionId" | "sessionId" | "userId" | "actionId" | "utmParams"
>;

export type RecordActionEntryInput = TrackingActionEntryCreateFields;

export interface GetTrackingEntriesOptions {
  missionId?: string;
  sessionId?: string;
  userId?: string;
  actionId?: string;
}
