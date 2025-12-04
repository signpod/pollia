import type { Mission } from "@prisma/client";

export type { Mission };

export type MissionSummary = Pick<
  Mission,
  "id" | "title" | "description" | "imageUrl" | "createdAt" | "updatedAt"
>;
