import type { Prisma } from "@prisma/client";

export type UpsertNotionPageInput = Pick<
  Prisma.MissionNotionPageUncheckedCreateInput,
  "notionPageId" | "notionPageUrl" | "syncedResponseCount"
>;
