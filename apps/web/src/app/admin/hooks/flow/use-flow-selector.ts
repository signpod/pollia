"use client";

import { useCallback, useState } from "react";

export type SelectorState = {
  open: boolean;
  nodeId: string;
  nodeType: "start" | "action" | "branch-option";
  optionId?: string;
};

export function useFlowSelector() {
  const [selectorState, setSelectorState] = useState<SelectorState>({
    open: false,
    nodeId: "",
    nodeType: "start",
  });

  const handlePlusClick = useCallback(
    (nodeId: string, nodeType: "start" | "action" | "branch-option", optionId?: string) => {
      setSelectorState({
        open: true,
        nodeId,
        nodeType,
        optionId,
      });
    },
    [],
  );

  const openSelector = useCallback(
    (nodeId: string, nodeType: "start" | "action" | "branch-option", optionId?: string) => {
      setSelectorState({
        open: true,
        nodeId,
        nodeType,
        optionId,
      });
    },
    [],
  );

  const closeSelector = useCallback(() => {
    setSelectorState(prev => ({ ...prev, open: false }));
  }, []);

  return {
    selectorState,
    handlePlusClick,
    openSelector,
    closeSelector,
  };
}

export type UseFlowSelectorReturn = ReturnType<typeof useFlowSelector>;
