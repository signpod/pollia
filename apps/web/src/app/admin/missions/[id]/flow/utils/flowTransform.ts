import type { Action, ActionOption, Mission, MissionCompletion } from "@prisma/client";
import type { Edge, Node } from "@xyflow/react";

// Layout constants
const VERTICAL_SPACING = 150;
const HORIZONTAL_SPACING = 300;
const START_X = 400;

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

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

function createStartNode(mission: Mission, y: number): FlowNode {
  return {
    id: NODE_TYPES.START,
    type: NODE_TYPES.START,
    position: { x: START_X, y },
    data: { mission },
  };
}

function createActionNode(
  action: Action & { options: ActionOption[] },
  x: number,
  y: number,
): FlowNode {
  const isBranch = action.type === "BRANCH";
  return {
    id: action.id,
    type: isBranch ? NODE_TYPES.BRANCH_ACTION : NODE_TYPES.ACTION,
    position: { x, y },
    data: { action },
  };
}

function createCompletionNode(completion: MissionCompletion, x: number, y: number): FlowNode {
  return {
    id: completion.id,
    type: NODE_TYPES.COMPLETION,
    position: { x, y },
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

function calculateBranchX(baseX: number, optionIndex: number): number {
  return baseX + (optionIndex === 0 ? -HORIZONTAL_SPACING / 2 : HORIZONTAL_SPACING / 2);
}

function processBranchOption(
  action: Action & { options: ActionOption[] },
  option: ActionOption,
  optionIndex: number,
  current: NodePosition,
  processedNodes: Set<string>,
  nodeQueue: NodePosition[],
  edges: Edge[],
): void {
  const branchX = calculateBranchX(current.x, optionIndex);
  const branchY = current.y + VERTICAL_SPACING;

  if (option.nextActionId) {
    edges.push(createEdge(action.id, option.nextActionId, option.id));

    if (!processedNodes.has(option.nextActionId)) {
      nodeQueue.push({ id: option.nextActionId, x: branchX, y: branchY });
    }
  }

  if (option.nextCompletionId) {
    edges.push(createEdge(action.id, option.nextCompletionId, option.id));

    if (!processedNodes.has(option.nextCompletionId)) {
      nodeQueue.push({ id: option.nextCompletionId, x: branchX, y: branchY });
    }
  }
}

function processActionConnections(
  action: Action & { options: ActionOption[] },
  current: NodePosition,
  processedNodes: Set<string>,
  nodeQueue: NodePosition[],
  edges: Edge[],
): void {
  if (action.nextActionId) {
    edges.push(createEdge(action.id, action.nextActionId));

    if (!processedNodes.has(action.nextActionId)) {
      nodeQueue.push({
        id: action.nextActionId,
        x: current.x,
        y: current.y + VERTICAL_SPACING,
      });
    }
  }

  if (action.nextCompletionId) {
    edges.push(createEdge(action.id, action.nextCompletionId));

    if (!processedNodes.has(action.nextCompletionId)) {
      nodeQueue.push({
        id: action.nextCompletionId,
        x: current.x,
        y: current.y + VERTICAL_SPACING,
      });
    }
  }
}

// Main transformation function
export function transformToFlowGraph(data: FlowGraphData): {
  nodes: FlowNode[];
  edges: Edge[];
} {
  const { mission, actions, completions } = data;
  const nodes: FlowNode[] = [];
  const edges: Edge[] = [];

  let currentY = 0;

  nodes.push(createStartNode(mission, currentY));

  if (mission.entryActionId) {
    edges.push(createEdge(NODE_TYPES.START, mission.entryActionId));
  }

  currentY += VERTICAL_SPACING;

  const processedNodes = new Set<string>();
  const nodeQueue: NodePosition[] = [];

  if (mission.entryActionId) {
    nodeQueue.push({ id: mission.entryActionId, x: START_X, y: currentY });
  }

  while (nodeQueue.length > 0) {
    const current = nodeQueue.shift();
    if (!current) break;

    if (processedNodes.has(current.id)) continue;
    processedNodes.add(current.id);

    const action = actions.find(a => a.id === current.id);
    const completion = completions.find(c => c.id === current.id);

    if (action) {
      nodes.push(createActionNode(action, current.x, current.y));

      const isBranch = action.type === "BRANCH";
      if (isBranch && action.options.length > 0) {
        action.options.forEach((option, index) => {
          processBranchOption(action, option, index, current, processedNodes, nodeQueue, edges);
        });
      } else {
        processActionConnections(action, current, processedNodes, nodeQueue, edges);
      }
    }

    if (completion) {
      nodes.push(createCompletionNode(completion, current.x, current.y));
    }
  }

  return { nodes, edges };
}
