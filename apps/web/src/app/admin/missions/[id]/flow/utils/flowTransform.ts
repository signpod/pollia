"use client";

import type { Action, ActionOption, Mission, MissionCompletion } from "@prisma/client";
import type { Edge, Node } from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";

// Node type constants
const NODE_TYPES = {
  START: "start",
  ACTION: "action",
  BRANCH_ACTION: "branch-action",
  COMPLETION: "completion",
} as const;

export interface FlowGraphData {
  mission: Mission;
  actions: (Action & { options: ActionOption[] })[];
  completions: MissionCompletion[];
}

export interface FlowNode extends Node {
  data: {
    mission?: Mission;
    action?: Action & { options: ActionOption[] };
    completion?: MissionCompletion;
    onAddAction?: () => void;
  };
}

interface NodeToProcess {
  id: string;
}

function createStartNode(mission: Mission): FlowNode {
  return {
    id: NODE_TYPES.START,
    type: NODE_TYPES.START,
    position: { x: 0, y: 0 },
    data: { mission },
  };
}

function createActionNode(action: Action & { options: ActionOption[] }): FlowNode {
  const isBranch = action.type === "BRANCH";
  return {
    id: action.id,
    type: isBranch ? NODE_TYPES.BRANCH_ACTION : NODE_TYPES.ACTION,
    position: { x: 0, y: 0 },
    data: { action },
  };
}

function createCompletionNode(completion: MissionCompletion): FlowNode {
  return {
    id: completion.id,
    type: NODE_TYPES.COMPLETION,
    position: { x: 0, y: 0 },
    data: { completion },
  };
}

function createEdge(source: string, target: string, sourceHandle?: string): Edge {
  const id = sourceHandle ? `${source}-${sourceHandle}-${target}` : `${source}-${target}`;

  return {
    id,
    source,
    target,
    ...(sourceHandle && { sourceHandle }),
  };
}

const elk = new ELK();

const NODE_SIZES = {
  start: { width: 400, height: 100 },
  action: { width: 400, height: 150 },
  "branch-action": { width: 400, height: 300 },
  completion: { width: 400, height: 100 },
} as const;

export async function getLayoutedElements(
  nodes: FlowNode[],
  edges: Edge[],
): Promise<{ nodes: FlowNode[]; edges: Edge[] }> {
  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.layered.spacing.nodeNodeBetweenLayers": "100",
      "elk.spacing.nodeNode": "80",
      "elk.direction": "DOWN",
    },
    children: nodes.map(node => {
      const size = NODE_SIZES[node.type as keyof typeof NODE_SIZES] || { width: 400, height: 150 };
      return {
        id: node.id,
        width: size.width,
        height: size.height,
      };
    }),
    edges: edges.map(edge => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  const layoutedNodes = nodes.map(node => {
    const layoutedNode = layoutedGraph.children?.find(n => n.id === node.id);
    return {
      ...node,
      position: {
        x: layoutedNode?.x ?? 0,
        y: layoutedNode?.y ?? 0,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

function processBranchOption(
  action: Action & { options: ActionOption[] },
  option: ActionOption,
  processedNodes: Set<string>,
  nodeQueue: NodeToProcess[],
  edges: Edge[],
): void {
  if (option.nextActionId) {
    edges.push(createEdge(action.id, option.nextActionId, option.id));

    if (!processedNodes.has(option.nextActionId)) {
      nodeQueue.push({ id: option.nextActionId });
    }
  }

  if (option.nextCompletionId) {
    edges.push(createEdge(action.id, option.nextCompletionId, option.id));

    if (!processedNodes.has(option.nextCompletionId)) {
      nodeQueue.push({ id: option.nextCompletionId });
    }
  }
}

function processActionConnections(
  action: Action & { options: ActionOption[] },
  processedNodes: Set<string>,
  nodeQueue: NodeToProcess[],
  edges: Edge[],
): void {
  if (action.nextActionId) {
    edges.push(createEdge(action.id, action.nextActionId));

    if (!processedNodes.has(action.nextActionId)) {
      nodeQueue.push({ id: action.nextActionId });
    }
  }

  if (action.nextCompletionId) {
    edges.push(createEdge(action.id, action.nextCompletionId));

    if (!processedNodes.has(action.nextCompletionId)) {
      nodeQueue.push({ id: action.nextCompletionId });
    }
  }
}

// Main transformation function
export async function transformToFlowGraph(data: FlowGraphData): Promise<{
  nodes: FlowNode[];
  edges: Edge[];
}> {
  const { mission, actions, completions } = data;
  const nodes: FlowNode[] = [];
  const edges: Edge[] = [];

  nodes.push(createStartNode(mission));

  if (mission.entryActionId) {
    edges.push(createEdge(NODE_TYPES.START, mission.entryActionId));
  }

  const processedNodes = new Set<string>();
  const nodeQueue: NodeToProcess[] = [];

  if (mission.entryActionId) {
    nodeQueue.push({ id: mission.entryActionId });
  }

  while (nodeQueue.length > 0) {
    const current = nodeQueue.shift();
    if (!current) break;

    if (processedNodes.has(current.id)) continue;
    processedNodes.add(current.id);

    const action = actions.find(a => a.id === current.id);
    const completion = completions.find(c => c.id === current.id);

    if (action) {
      nodes.push(createActionNode(action));

      const isBranch = action.type === "BRANCH";
      if (isBranch && action.options.length > 0) {
        const sortedOptions = [...action.options].sort((a, b) => a.order - b.order);
        sortedOptions.forEach(option => {
          processBranchOption(action, option, processedNodes, nodeQueue, edges);
        });
      } else {
        processActionConnections(action, processedNodes, nodeQueue, edges);
      }
    }

    if (completion) {
      nodes.push(createCompletionNode(completion));
    }
  }

  return getLayoutedElements(nodes, edges);
}
