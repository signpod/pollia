"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";

import { useFlowConnections } from "@/app/admin/hooks/flow/use-flow-connections";
import { useFlowGraph } from "@/app/admin/hooks/flow/use-flow-graph";
import { useFlowValidation } from "@/app/admin/hooks/flow/use-flow-validation";
import type { FlowNode } from "@/app/admin/missions/[id]/flow/utils/flowTransform";

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

type SelectorState = {
  open: boolean;
  nodeId: string;
  nodeType: "start" | "action" | "branch-option";
  optionId?: string;
};

export function FlowCanvas({ missionId }: FlowCanvasProps) {
  const { nodes, edges, isLoading, error } = useFlowGraph(missionId);
  const connections = useFlowConnections(missionId);

  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);

  const [selectorState, setSelectorState] = useState<SelectorState>({
    open: false,
    nodeId: "",
    nodeType: "start",
  });

  const validation = useFlowValidation(nodesState, edgesState);

  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

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

  const connectedNodeIds = useMemo(() => {
    const ids = new Set<string>(["start"]);
    nodesState.forEach(node => {
      if (node.id !== "start") {
        ids.add(node.id);
      }
    });
    return ids;
  }, [nodesState]);

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">플로우를 불러오는 중...</p>
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
        open={selectorState.open}
        onOpenChange={open => setSelectorState(prev => ({ ...prev, open }))}
        missionId={missionId}
        sourceType={selectorState.nodeType}
        onSelectAction={handleSelectAction}
        onSelectCompletion={handleSelectCompletion}
        trigger={<div />}
        connectedNodeIds={connectedNodeIds}
      />
    </>
  );
}
