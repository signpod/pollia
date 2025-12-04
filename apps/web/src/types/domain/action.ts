import type { Action } from "@prisma/client";
import { ActionType } from "@prisma/client";

export { ActionType };
export type { Action };

export type ActionSummary = Pick<Action, "id" | "title" | "type" | "createdAt">;
