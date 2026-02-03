"use client";

import type { UseFlowConnectionsReturn } from "@/app/admin/hooks/flow/use-flow-connections";
import type { FlowNode } from "@/app/admin/missions/[id]/flow/utils/flowTransform";
import type { Edge, Node } from "@xyflow/react";
import { useCallback } from "react";

export function useFlowEdgeHandler(
  nodesState: Node[],
  edgesState: Edge[],
  connections: UseFlowConnectionsReturn,
) {
  const handleEdgeDelete = useCallback(
    async (edgeId: string) => {
      if (connections.isPending) return;

      const edge = edgesState.find(e => e.id === edgeId);
      if (!edge) return;

      const { source, target, sourceHandle } = edge;

      if (source === "start") {
        await connections.disconnectStart(target);
        return;
      }

      const sourceNode = nodesState.find(n => n.id === source) as FlowNode | undefined;
      if (!sourceNode) return;

      if (sourceHandle && sourceNode.type === "branch-action") {
        await connections.disconnectBranchOption(source, sourceHandle);
        return;
      }

      await connections.disconnectAction(source);
    },
    [connections, edgesState, nodesState],
  );

  return {
    handleEdgeDelete,
  };
}

export type UseFlowEdgeHandlerReturn = ReturnType<typeof useFlowEdgeHandler>;
