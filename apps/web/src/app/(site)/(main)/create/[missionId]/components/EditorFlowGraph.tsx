"use client";

import { Background, Controls, ReactFlow } from "@xyflow/react";
import type { NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { useEditor } from "../context/EditorContext";
import { buildEditorFlowGraph } from "../lib/editorFlowGraph";
import { ActionNode, CompletionNode, StartNode } from "./flow/EditorFlowNodes";

const nodeTypes: NodeTypes = {
  start: StartNode,
  action: ActionNode,
  completion: CompletionNode,
};

export function EditorFlowGraph() {
  const {
    previewMission,
    previewActions,
    previewCompletions,
    requestOpenAction,
    requestOpenCompletion,
  } = useEditor();

  const { nodes, edges } = useMemo(
    () => buildEditorFlowGraph(previewMission, previewActions, previewCompletions),
    [previewMission, previewActions, previewCompletions],
  );

  return (
    <div className="h-full w-full min-h-[200px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        onNodeClick={(_, node) => {
          if (node.type === "action" && node.id !== "start") requestOpenAction(node.id);
          if (node.type === "completion") requestOpenCompletion(node.id);
        }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
