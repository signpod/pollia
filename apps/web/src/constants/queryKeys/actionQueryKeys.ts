import { ActionType } from "@/types/domain/action";

export const actionQueryKeys = {
  actions: (params?: {
    missionId?: string;
    searchQuery?: string;
    selectedActionTypes?: ActionType[];
    isDraft?: boolean;
  }) => {
    const base = params?.missionId
      ? (["actions", params.missionId] as const)
      : (["actions"] as const);

    const hasFilters =
      params?.searchQuery ||
      (params?.selectedActionTypes && params.selectedActionTypes.length > 0) ||
      params?.isDraft !== undefined;

    if (!hasFilters) {
      return base;
    }

    return [
      ...base,
      {
        searchQuery: params?.searchQuery ?? "",
        selectedQuestionTypes: params?.selectedActionTypes ?? [],
        isDraft: params?.isDraft ?? false,
      },
    ] as const;
  },
  action: (actionId: string) => ["action", actionId] as const,
  actionsIds: (params: { missionId: string }) => ["actions-ids", params.missionId] as const,
} as const;

export type ActionQueryKeys = typeof actionQueryKeys;
