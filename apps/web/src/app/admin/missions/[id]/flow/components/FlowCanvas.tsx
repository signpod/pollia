"use client";

import {
  Background,
  type Connection,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo } from "react";
import "@xyflow/react/dist/style.css";

import { useFlowConnections } from "@/app/admin/hooks/flow/use-flow-connections";
import { useFlowGraph } from "@/app/admin/hooks/flow/use-flow-graph";
import { useFlowValidation } from "@/app/admin/hooks/flow/use-flow-validation";

import { ActionNode } from "./nodes/ActionNode";
import { BranchActionNode } from "./nodes/BranchActionNode";
import { CompletionNode } from "./nodes/CompletionNode";
import { StartNode } from "./nodes/StartNode";
import { ErrorSummaryPanel } from "./panels/ErrorSummaryPanel";

const nodeTypes = {
  start: StartNode,
  action: ActionNode,
  "branch-action": BranchActionNode,
  completion: CompletionNode,
};

interface FlowCanvasProps {
  missionId: string;
}

export function FlowCanvas({ missionId }: FlowCanvasProps) {
  const { nodes, edges, isLoading, error } = useFlowGraph(missionId);
  const { handleStartConnection, handleBranchConnection, handleActionConnection } =
    useFlowConnections(missionId);

  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);

  const validation = useFlowValidation(nodesState, edgesState);

  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  const nodesWithValidation = useMemo(() => {
    return nodesState.map(node => ({
      ...node,
      data: {
        ...node.data,
        isUnreachable: validation.unreachableNodes.has(node.id),
        isDeadEnd: validation.deadEndNodes.has(node.id),
      },
    }));
  }, [nodesState, validation]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(oldEdges => addEdge(connection, oldEdges));

      const sourceNode = nodesState.find(n => n.id === connection.source);
      const targetNode = nodesState.find(n => n.id === connection.target);
      const isCompletion = targetNode?.type === "completion";

      if (connection.source === "start") {
        handleStartConnection(connection);
      } else if (sourceNode?.type === "branch-action") {
        handleBranchConnection(connection, sourceNode, isCompletion);
      } else {
        handleActionConnection(connection, isCompletion);
      }
    },
    [nodesState, setEdges, handleStartConnection, handleBranchConnection, handleActionConnection],
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">플로우를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">플로우를 불러오는데 실패했습니다</p>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodesWithValidation}
      edges={edgesState}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap />
      <ErrorSummaryPanel validation={validation} />
    </ReactFlow>
  );
}
