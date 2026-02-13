"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";

import { useFlowConnectionHandler } from "@/app/admin/hooks/flow/use-flow-connection-handler";
import { useFlowConnections } from "@/app/admin/hooks/flow/use-flow-connections";
import { useFlowEdgeHandler } from "@/app/admin/hooks/flow/use-flow-edge-handler";
import { useFlowGraph } from "@/app/admin/hooks/flow/use-flow-graph";
import { useFlowNodeEnrichment } from "@/app/admin/hooks/flow/use-flow-node-enrichment";
import { useFlowSelector } from "@/app/admin/hooks/flow/use-flow-selector";
import { useFlowValidation } from "@/app/admin/hooks/flow/use-flow-validation";
import { getLayoutedElements } from "@/app/admin/missions/[id]/flow/utils/flowTransform";
import type { Edge, Node } from "@xyflow/react";

import { ActionSelector } from "./ActionSelector";
import { EdgeWithDeleteButton } from "./edges/EdgeWithDeleteButton";
import { ActionNode } from "./nodes/ActionNode";
import { BranchActionNode } from "./nodes/BranchActionNode";
import { CompletionNode } from "./nodes/CompletionNode";
import { StartNode } from "./nodes/StartNode";
import { ErrorSummaryPanel } from "./panels/ErrorSummaryPanel";
import { UnreachableNodesPanel } from "./panels/UnreachableNodesPanel";

const nodeTypes = {
  start: StartNode,
  action: ActionNode,
  "branch-action": BranchActionNode,
  completion: CompletionNode,
};

const edgeTypes = {
  default: EdgeWithDeleteButton,
};

interface FlowCanvasProps {
  missionId: string;
}

export function FlowCanvas({ missionId }: FlowCanvasProps) {
  const { nodes: rawNodes, edges: rawEdges, isLoading, error } = useFlowGraph(missionId);
  const connections = useFlowConnections(missionId);

  const [layoutedNodes, setLayoutedNodes] = useState<Node[]>([]);
  const [layoutedEdges, setLayoutedEdges] = useState<Edge[]>([]);
  const [isLayouting, setIsLayouting] = useState(false);

  const [nodesState, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const validation = useFlowValidation(nodesState, edgesState);
  const selector = useFlowSelector();
  const edgeHandler = useFlowEdgeHandler(nodesState, edgesState, connections);
  const connectionHandler = useFlowConnectionHandler(selector.selectorState, connections);
  const { nodesWithHandlers, edgesWithHandlers } = useFlowNodeEnrichment(
    nodesState,
    edgesState,
    validation,
    {
      handlePlusClick: selector.handlePlusClick,
      handleEdgeDelete: edgeHandler.handleEdgeDelete,
    },
  );

  useEffect(() => {
    let cancelled = false;

    async function applyLayout() {
      if (rawNodes.length === 0 && rawEdges.length === 0) {
        setLayoutedNodes([]);
        setLayoutedEdges([]);
        return;
      }

      setIsLayouting(true);

      try {
        const layouted = await getLayoutedElements(rawNodes, rawEdges);

        if (!cancelled) {
          setLayoutedNodes(layouted.nodes);
          setLayoutedEdges(layouted.edges);
        }
      } catch (error) {
        console.error("레이아웃 적용 실패:", error);
      } finally {
        if (!cancelled) {
          setIsLayouting(false);
        }
      }
    }

    applyLayout();

    return () => {
      cancelled = true;
    };
  }, [rawNodes, rawEdges]);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const connectedNodeIds = useMemo(() => {
    const ids = new Set<string>(["start"]);
    nodesState.forEach(node => {
      if (node.id !== "start") {
        ids.add(node.id);
      }
    });
    return ids;
  }, [nodesState]);

  if (isLoading || isLayouting) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          {isLoading ? "플로우를 불러오는 중..." : "레이아웃을 적용하는 중..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">플로우를 불러오는데 실패했습니다</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다"}
        </p>
      </div>
    );
  }

  return (
    <>
      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edgesWithHandlers}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          style: { strokeWidth: 2 },
        }}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        {connections.isPending && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium shadow-lg">
              연결 작업 중...
            </div>
          </div>
        )}
        <ErrorSummaryPanel validation={validation} />
        <UnreachableNodesPanel missionId={missionId} connectedNodeIds={connectedNodeIds} />
      </ReactFlow>

      <ActionSelector
        open={selector.selectorState.open}
        onOpenChange={open => {
          if (!open) {
            selector.closeSelector();
          }
        }}
        missionId={missionId}
        sourceType={selector.selectorState.nodeType}
        onSelectAction={connectionHandler.handleSelectAction}
        onSelectCompletion={connectionHandler.handleSelectCompletion}
        trigger={<div />}
        connectedNodeIds={connectedNodeIds}
      />
    </>
  );
}
