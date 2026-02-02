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
import type { ActionOption } from "@prisma/client";

import { ActionSelector } from "./ActionSelector";
import { NodeActionMenu } from "./NodeActionMenu";
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

interface FlowCanvasProps {
  missionId: string;
}

type SelectorState = {
  open: boolean;
  nodeId: string;
  nodeType: "start" | "action" | "branch-option";
  optionId?: string;
};

type MenuState = {
  open: boolean;
  nodeId: string;
  nodeType: "action" | "branch-option";
  optionId?: string;
  targetId: string;
  targetTitle: string;
  targetType: "action" | "completion";
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

  const [menuState, setMenuState] = useState<MenuState | null>(null);

  const validation = useFlowValidation(nodesState, edgesState);

  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

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

  const handleNodeClick = useCallback(
    (
      nodeId: string,
      targetId: string,
      targetTitle: string,
      targetType: "action" | "completion",
    ) => {
      setMenuState({
        open: true,
        nodeId,
        nodeType: "action",
        targetId,
        targetTitle,
        targetType,
      });
    },
    [],
  );

  const handleOptionClick = useCallback(
    (
      actionId: string,
      optionId: string,
      targetId: string,
      targetTitle: string,
      targetType: "action" | "completion",
    ) => {
      setMenuState({
        open: true,
        nodeId: actionId,
        nodeType: "branch-option",
        optionId,
        targetId,
        targetTitle,
        targetType,
      });
    },
    [],
  );

  const handleSelectAction = useCallback(
    (targetActionId: string) => {
      const { nodeId, nodeType, optionId } = selectorState;

      if (nodeType === "start") {
        connections.connectStartToAction(targetActionId);
      } else if (nodeType === "branch-option" && optionId) {
        const node = nodesState.find(n => n.id === nodeId) as FlowNode | undefined;
        const action = node?.data.action;
        if (action?.options) {
          connections.connectBranchOptionToTarget(
            nodeId,
            optionId,
            action.options,
            targetActionId,
            false,
          );
        }
      } else {
        connections.connectActionToTarget(nodeId, targetActionId, false);
      }
    },
    [selectorState, nodesState, connections],
  );

  const handleSelectCompletion = useCallback(
    (targetCompletionId: string) => {
      const { nodeId, nodeType, optionId } = selectorState;

      if (nodeType === "branch-option" && optionId) {
        const node = nodesState.find(n => n.id === nodeId) as FlowNode | undefined;
        const action = node?.data.action;
        if (action?.options) {
          connections.connectBranchOptionToTarget(
            nodeId,
            optionId,
            action.options,
            targetCompletionId,
            true,
          );
        }
      } else {
        connections.connectActionToTarget(nodeId, targetCompletionId, true);
      }
    },
    [selectorState, nodesState, connections],
  );

  const handleDisconnect = useCallback(() => {
    if (!menuState) return;

    const { nodeId, nodeType, optionId } = menuState;

    if (nodeType === "branch-option" && optionId) {
      const node = nodesState.find(n => n.id === nodeId) as FlowNode | undefined;
      const action = node?.data.action;
      if (action?.options) {
        connections.disconnectBranchOption(nodeId, optionId, action.options);
      }
    } else {
      connections.disconnectAction(nodeId);
    }
  }, [menuState, nodesState, connections]);

  const handleReconnect = useCallback(() => {
    if (!menuState) return;

    setSelectorState({
      open: true,
      nodeId: menuState.nodeId,
      nodeType: menuState.nodeType,
      optionId: menuState.optionId,
    });
  }, [menuState]);

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
        const action = flowNode.data.action;
        const targetId = action?.nextActionId || action?.nextCompletionId;
        const targetNode = nodesState.find(n => n.id === targetId) as FlowNode | undefined;

        return {
          ...flowNode,
          data: {
            ...baseData,
            onPlusClick: () => handlePlusClick(flowNode.id, "action"),
            onNodeClick: targetNode
              ? () =>
                  handleNodeClick(
                    flowNode.id,
                    targetNode.id,
                    targetNode.data.action?.title || targetNode.data.completion?.title || "",
                    targetNode.type === "completion" ? "completion" : "action",
                  )
              : undefined,
          },
        };
      }

      if (flowNode.type === "branch-action") {
        const action = flowNode.data.action;

        return {
          ...flowNode,
          data: {
            ...baseData,
            onOptionPlusClick: (optionId: string) =>
              handlePlusClick(flowNode.id, "branch-option", optionId),
            onOptionClick: (optionId: string) => {
              const option = action?.options.find((o: ActionOption) => o.id === optionId);
              const targetId = option?.nextActionId || option?.nextCompletionId;
              const targetNode = nodesState.find(n => n.id === targetId) as FlowNode | undefined;

              if (targetNode) {
                handleOptionClick(
                  flowNode.id,
                  optionId,
                  targetNode.id,
                  targetNode.data.action?.title || targetNode.data.completion?.title || "",
                  targetNode.type === "completion" ? "completion" : "action",
                );
              }
            },
          },
        };
      }

      return {
        ...flowNode,
        data: baseData,
      };
    });
  }, [nodesState, validation, handlePlusClick, handleNodeClick, handleOptionClick]);

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
    <>
      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
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
      />

      {menuState && (
        <NodeActionMenu
          open={menuState.open}
          onOpenChange={open => setMenuState(prev => (prev ? { ...prev, open } : null))}
          currentConnection={{
            targetId: menuState.targetId,
            targetTitle: menuState.targetTitle,
            targetType: menuState.targetType,
          }}
          onDisconnect={handleDisconnect}
          onReconnect={handleReconnect}
        />
      )}
    </>
  );
}
