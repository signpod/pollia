"use client";

import type { UseFlowValidationReturn } from "@/app/admin/hooks/flow/use-flow-validation";
import type { FlowNode } from "@/app/admin/missions/[id]/flow/utils/flowTransform";
import type { Edge, Node } from "@xyflow/react";
import { useMemo } from "react";

type FlowHandlers = {
  handlePlusClick: (
    nodeId: string,
    nodeType: "start" | "action" | "branch-option",
    optionId?: string,
  ) => void;
  handleEdgeDelete: (edgeId: string) => Promise<void>;
};

export function useFlowNodeEnrichment(
  nodesState: Node[],
  edgesState: Edge[],
  validation: UseFlowValidationReturn,
  handlers: FlowHandlers,
) {
  const { handlePlusClick, handleEdgeDelete } = handlers;

  const nodesWithHandlers = useMemo(() => {
    return nodesState.map(node => {
      const flowNode = node as FlowNode;
      const baseData = {
        ...flowNode.data,
        isUnreachable: validation.unreachableNodes.has(flowNode.id),
        isDeadEnd: validation.deadEndNodes.has(flowNode.id),
      };

      if (flowNode.type === "start") {
        return {
          ...flowNode,
          data: {
            ...baseData,
            onPlusClick: () => handlePlusClick(flowNode.id, "start"),
          },
        };
      }

      if (flowNode.type === "action") {
        return {
          ...flowNode,
          data: {
            ...baseData,
            onPlusClick: () => handlePlusClick(flowNode.id, "action"),
          },
        };
      }

      if (flowNode.type === "branch-action") {
        return {
          ...flowNode,
          data: {
            ...baseData,
            onOptionPlusClick: (optionId: string) =>
              handlePlusClick(flowNode.id, "branch-option", optionId),
          },
        };
      }

      return {
        ...flowNode,
        data: baseData,
      };
    });
  }, [nodesState, validation, handlePlusClick]);

  const edgesWithHandlers = useMemo(() => {
    return edgesState.map(edge => ({
      ...edge,
      data: {
        ...edge.data,
        onDelete: handleEdgeDelete,
      },
    }));
  }, [edgesState, handleEdgeDelete]);

  return {
    nodesWithHandlers,
    edgesWithHandlers,
  };
}

export type UseFlowNodeEnrichmentReturn = ReturnType<typeof useFlowNodeEnrichment>;
