"use client";

import { useReadActionsDetail } from "@/app/admin/hooks/action/use-read-actions-detail";
import { useReadCompletions } from "@/app/admin/hooks/mission-completion/use-read-completions";
import { useReadMission } from "@/app/admin/hooks/mission/use-read-mission";
import { transformToFlowGraph } from "@/app/admin/missions/[id]/flow/utils/flowTransform";
import type { Edge, Node } from "@xyflow/react";
import { useEffect, useState } from "react";

export function useFlowGraph(missionId: string) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const {
    data: missionData,
    isLoading: missionLoading,
    error: missionError,
  } = useReadMission(missionId);

  const {
    data: actionsData,
    isLoading: actionsLoading,
    error: actionsError,
  } = useReadActionsDetail(missionId);

  const {
    data: completionsData,
    isLoading: completionsLoading,
    error: completionsError,
  } = useReadCompletions(missionId);

  useEffect(() => {
    async function transformGraph() {
      if (!missionData?.data || !actionsData?.data || !completionsData?.data) {
        setNodes([]);
        setEdges([]);
        return;
      }

      const result = await transformToFlowGraph({
        mission: missionData.data,
        actions: actionsData.data,
        completions: completionsData.data,
      });

      setNodes(result.nodes);
      setEdges(result.edges);
    }

    transformGraph();
  }, [missionData, actionsData, completionsData]);

  return {
    nodes,
    edges,
    isLoading: missionLoading || actionsLoading || completionsLoading,
    error: missionError || actionsError || completionsError,
  };
}

export type UseFlowGraphReturn = ReturnType<typeof useFlowGraph>;
