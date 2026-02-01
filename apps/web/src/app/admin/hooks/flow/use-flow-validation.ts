"use client";

import { validateFlowGraph } from "@/app/admin/missions/[id]/flow/utils/flowValidation";
import type { Edge, Node } from "@xyflow/react";
import { useMemo } from "react";

export function useFlowValidation(nodes: Node[], edges: Edge[]) {
  return useMemo(() => {
    return validateFlowGraph(nodes, edges);
  }, [nodes, edges]);
}

export type UseFlowValidationReturn = ReturnType<typeof useFlowValidation>;
