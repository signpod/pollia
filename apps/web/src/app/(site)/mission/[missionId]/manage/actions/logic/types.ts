import type { ActionDetail } from "@/types/dto";

export type ConnectionIntent =
  | null
  | {
      kind: "action";
      sourceActionId: string;
    }
  | {
      kind: "branch-option";
      sourceActionId: string;
      sourceOptionId: string;
    };

export interface UseManageActionsControllerParams {
  missionId: string;
  actions: ActionDetail[];
}
