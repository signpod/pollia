import type { Prisma } from "@prisma/client";

type MissionCompletionCreateFields = Pick<
  Prisma.MissionCompletionUncheckedCreateInput,
  "title" | "description" | "imageUrl" | "imageFileUploadId" | "links" | "missionId"
>;

export type CreateMissionCompletionInput = MissionCompletionCreateFields;

export type UpdateMissionCompletionInput = Partial<
  Omit<MissionCompletionCreateFields, "missionId">
>;
