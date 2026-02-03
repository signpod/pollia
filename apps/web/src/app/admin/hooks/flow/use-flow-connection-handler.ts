"use client";

import type { UseFlowConnectionsReturn } from "@/app/admin/hooks/flow/use-flow-connections";
import type { SelectorState } from "@/app/admin/hooks/flow/use-flow-selector";
import { useCallback } from "react";

export function useFlowConnectionHandler(
  selectorState: SelectorState,
  connections: UseFlowConnectionsReturn,
) {
  const handleSelectAction = useCallback(
    (targetActionId: string) => {
      const { nodeId, nodeType, optionId } = selectorState;

      if (nodeType === "start") {
        connections.connectStartToAction(targetActionId);
      } else if (nodeType === "branch-option" && optionId) {
        connections.connectBranchOptionToTarget(nodeId, optionId, targetActionId, false);
      } else {
        connections.connectActionToTarget(nodeId, targetActionId, false);
      }
    },
    [selectorState, connections],
  );

  const handleSelectCompletion = useCallback(
    (targetCompletionId: string) => {
      const { nodeId, nodeType, optionId } = selectorState;

      if (nodeType === "branch-option" && optionId) {
        connections.connectBranchOptionToTarget(nodeId, optionId, targetCompletionId, true);
      } else {
        connections.connectActionToTarget(nodeId, targetCompletionId, true);
      }
    },
    [selectorState, connections],
  );

  return {
    handleSelectAction,
    handleSelectCompletion,
  };
}

export type UseFlowConnectionHandlerReturn = ReturnType<typeof useFlowConnectionHandler>;
