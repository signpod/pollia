import type { ActionDetail } from "@/types/dto";
import type { ActionType } from "@prisma/client";

export type DrawerMode = "closed" | "type-select" | "create" | "edit";

export interface CompletionOption {
  id: string;
  title: string;
}

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

export interface ManageActionsControllerState {
  drawerMode: DrawerMode;
  selectedType: ActionType | null;
  editingAction: ActionDetail | null;
  deleteTarget: ActionDetail | null;
  pendingConnection: ConnectionIntent;
}
