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

export interface FlowEdge extends Edge {
  layoutOptions?: {
    "elk.priority"?: string;
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

function createEdge(
  source: string,
  target: string,
  sourceHandle?: string,
  priority?: number,
): FlowEdge {
  const id = sourceHandle ? `${source}-${sourceHandle}-${target}` : `${source}-${target}`;

  const edge: FlowEdge = {
    id,
    source,
    target,
    ...(sourceHandle && { sourceHandle }),
  };

  if (priority !== undefined) {
    edge.layoutOptions = {
      "elk.priority": priority.toString(),
    };
  }

  return edge;
}

const elk = new ELK();

const NODE_SIZES = {
  start: { width: 400, height: 100 },
  action: { width: 400, height: 150 },
  "branch-action": { width: 400, height: 300 },
  completion: { width: 400, height: 100 },
} as const;

const ELK_LAYOUT_CONFIG = {
  algorithm: "layered",
  spacing: {
    nodeNodeBetweenLayers: 100,
    nodeNode: 80,
  },
  direction: "DOWN",
  considerModelOrder: "PREFER_EDGES",
  crossingMinimization: "true",
} as const;

const MIN_NODE_SPACING = 80;

interface ElkNode {
  id: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  ports?: ElkPort[];
}

interface ElkPort {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

function calculatePortX(
  node: ElkNode,
  portId: string,
  sortedOptions: { id: string; order: number }[],
): number | null {
  if (node.x === undefined) return null;

  const portIndex = sortedOptions.findIndex(opt => opt.id === portId);
  if (portIndex === -1) return null;

  const optionCount = sortedOptions.length;
  if (optionCount === 0) return null;

  const portPercentage = (100 / (optionCount + 1)) * (portIndex + 1);
  const portX = node.x + (node.width * portPercentage) / 100;

  return portX;
}

function adjustNodesForPortAlignment(
  layoutedGraph: { children?: ElkNode[] },
  edges: FlowEdge[],
  originalNodes: FlowNode[],
): void {
  if (!layoutedGraph.children) return;

  const portEdges = edges.filter(e => e.sourceHandle);

  portEdges.forEach(edge => {
    const sourceNode = layoutedGraph.children?.find(n => n.id === edge.source);
    const targetNode = layoutedGraph.children?.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode || !edge.sourceHandle) return;

    const originalNode = originalNodes.find(n => n.id === edge.source);
    if (!originalNode || originalNode.type !== "branch-action" || !originalNode.data.action) return;

    const sortedOptions = [...originalNode.data.action.options].sort((a, b) => a.order - b.order);
    const portX = calculatePortX(sourceNode, edge.sourceHandle, sortedOptions);
    if (portX === null) return;

    targetNode.x = portX - targetNode.width / 2;
  });

  const layers = new Map<number, ElkNode[]>();
  layoutedGraph.children.forEach(node => {
    if (node.y === undefined) return;
    const layerNodes = layers.get(node.y) || [];
    layerNodes.push(node);
    layers.set(node.y, layerNodes);
  });

  layers.forEach(layerNodes => {
    layerNodes.sort((a, b) => (a.x ?? 0) - (b.x ?? 0));

    for (let i = 1; i < layerNodes.length; i++) {
      const prev = layerNodes[i - 1];
      const curr = layerNodes[i];

      if (!prev || !curr || prev.x === undefined || curr.x === undefined) continue;

      const prevRight = prev.x + prev.width;
      const requiredLeft = prevRight + MIN_NODE_SPACING;

      if (curr.x < requiredLeft) {
        curr.x = requiredLeft;
      }
    }
  });
}

export async function getLayoutedElements(
  nodes: FlowNode[],
  edges: FlowEdge[],
): Promise<{ nodes: FlowNode[]; edges: FlowEdge[] }> {
  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": ELK_LAYOUT_CONFIG.algorithm,
      "elk.layered.spacing.nodeNodeBetweenLayers":
        ELK_LAYOUT_CONFIG.spacing.nodeNodeBetweenLayers.toString(),
      "elk.spacing.nodeNode": ELK_LAYOUT_CONFIG.spacing.nodeNode.toString(),
      "elk.direction": ELK_LAYOUT_CONFIG.direction,
      "elk.layered.considerModelOrder.strategy": ELK_LAYOUT_CONFIG.considerModelOrder,
      "elk.layered.crossingMinimization.semiInteractive": ELK_LAYOUT_CONFIG.crossingMinimization,
    },
    children: nodes.map(node => {
      const size = NODE_SIZES[node.type as keyof typeof NODE_SIZES] || { width: 400, height: 150 };
      const elkNode: {
        id: string;
        width: number;
        height: number;
        ports?: Array<{ id: string; layoutOptions: Record<string, string> }>;
      } = {
        id: node.id,
        width: size.width,
        height: size.height,
      };

      if (node.type === NODE_TYPES.BRANCH_ACTION && node.data.action) {
        const sortedOptions = [...node.data.action.options].sort((a, b) => a.order - b.order);
        elkNode.ports = sortedOptions.map((option, index) => ({
          id: option.id,
          layoutOptions: {
            "elk.port.side": "SOUTH",
            "elk.port.index": index.toString(),
          },
        }));
      }

      return elkNode;
    }),
    edges: edges.map(edge => {
      const elkEdge: {
        id: string;
        sources: string[];
        targets: string[];
        layoutOptions?: Record<string, string>;
      } = {
        id: edge.id,
        sources: [edge.sourceHandle || edge.source],
        targets: [edge.target],
      };

      if (edge.layoutOptions) {
        elkEdge.layoutOptions = edge.layoutOptions;
      }

      return elkEdge;
    }),
  };

  const layoutedGraph = await elk.layout(graph);

  adjustNodesForPortAlignment(layoutedGraph, edges, nodes);

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
  priority: number,
  processedNodes: Set<string>,
  nodeQueue: NodeToProcess[],
  edges: FlowEdge[],
): void {
  if (option.nextActionId) {
    edges.push(createEdge(action.id, option.nextActionId, option.id, priority));

    if (!processedNodes.has(option.nextActionId)) {
      nodeQueue.push({ id: option.nextActionId });
    }
  }

  if (option.nextCompletionId) {
    edges.push(createEdge(action.id, option.nextCompletionId, option.id, priority));

    if (!processedNodes.has(option.nextCompletionId)) {
      nodeQueue.push({ id: option.nextCompletionId });
    }
  }
}

function processActionConnections(
  action: Action & { options: ActionOption[] },
  processedNodes: Set<string>,
  nodeQueue: NodeToProcess[],
  edges: FlowEdge[],
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

function buildFlowGraphStructure(data: FlowGraphData): {
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  const { mission, actions, completions } = data;
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

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
        const maxOrder = Math.max(...sortedOptions.map(o => o.order));

        sortedOptions.forEach(option => {
          const priority = (maxOrder - option.order) * 100;
          processBranchOption(action, option, priority, processedNodes, nodeQueue, edges);
        });
      } else {
        processActionConnections(action, processedNodes, nodeQueue, edges);
      }
    }

    if (completion) {
      nodes.push(createCompletionNode(completion));
    }
  }

  return { nodes, edges };
}

export function transformToFlowGraph(data: FlowGraphData): {
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  return buildFlowGraphStructure(data);
}

export async function transformToFlowGraphWithLayout(data: FlowGraphData): Promise<{
  nodes: FlowNode[];
  edges: FlowEdge[];
}> {
  const { nodes, edges } = buildFlowGraphStructure(data);
  return getLayoutedElements(nodes, edges);
}
