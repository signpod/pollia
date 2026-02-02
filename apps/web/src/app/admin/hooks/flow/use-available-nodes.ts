"use client";

import { useReadActionsDetail } from "@/app/admin/hooks/action/use-read-actions-detail";
import { useReadCompletions } from "@/app/admin/hooks/mission-completion/use-read-completions";
import { useMemo } from "react";

export function useAvailableNodes(missionId: string, connectedNodeIds: Set<string>) {
  const { data: actionsData } = useReadActionsDetail(missionId);
  const { data: completionsData } = useReadCompletions(missionId);

  const availableActions = useMemo(() => {
    const actions = actionsData?.data ?? [];
    return actions.filter(action => !connectedNodeIds.has(action.id));
  }, [actionsData, connectedNodeIds]);

  const availableCompletions = useMemo(() => {
    const completions = completionsData?.data ?? [];
    return completions.filter(completion => !connectedNodeIds.has(completion.id));
  }, [completionsData, connectedNodeIds]);

  return { availableActions, availableCompletions };
}

export type UseAvailableNodesReturn = ReturnType<typeof useAvailableNodes>;
