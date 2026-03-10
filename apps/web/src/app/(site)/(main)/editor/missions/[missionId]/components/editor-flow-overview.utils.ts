import { ACTION_TYPE_LABELS } from "@/constants/action";
import { ActionType } from "@/types/domain/action";
import type { Edge, Node } from "@xyflow/react";
import type {
  EditorFlowAnalysisResult,
  EditorFlowConnection,
  PublishFlowIssueType,
} from "./editor-publish-flow-validation";

const START_NODE_ID = "start";
const HORIZONTAL_GAP = 350;
const VERTICAL_GAP = 250;

export type FlowOverviewNodeKind = "start" | "action" | "branch-action" | "completion";

export interface FlowOverviewNodeData {
  [key: string]: unknown;
  title: string;
  subtitle: string;
  kind: FlowOverviewNodeKind;
  compact: boolean;
  isUnreachable: boolean;
  isDeadEnd: boolean;
  isMissingEntry: boolean;
}

export type FlowOverviewNode = Node<FlowOverviewNodeData>;

export interface FlowOverviewSummary {
  actionCount: number;
  completionCount: number;
  connectionCount: number;
  missingEntryCount: number;
  missingCompletionCount: number;
  unreachableCount: number;
  deadEndCount: number;
}

function isBranchType(actionType: string): boolean {
  return actionType.toUpperCase() === ActionType.BRANCH;
}

function getActionTypeLabel(actionType: string): string {
  return ACTION_TYPE_LABELS[actionType as ActionType] ?? actionType;
}

function buildIssueNodeSet(
  analysis: EditorFlowAnalysisResult,
  type: PublishFlowIssueType,
): Set<string> {
  return new Set(analysis.issues.filter(issue => issue.type === type).map(issue => issue.nodeId));
}

function buildNodeDepths(
  nodes: FlowOverviewNode[],
  edges: Edge[],
  entryActionId: string | null,
): Map<string, number> {
  const outgoingByNodeId = new Map<string, string[]>();

  for (const edge of edges) {
    const current = outgoingByNodeId.get(edge.source) ?? [];
    current.push(edge.target);
    outgoingByNodeId.set(edge.source, current);
  }

  const depthByNodeId = new Map<string, number>([[START_NODE_ID, 0]]);
  const queue: string[] = [];

  if (entryActionId) {
    queue.push(entryActionId);
  }

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const parentDepth = current === entryActionId ? 0 : (depthByNodeId.get(current) ?? 0);
    if (current !== START_NODE_ID) {
      const existingDepth = depthByNodeId.get(current);
      if (existingDepth === undefined) {
        depthByNodeId.set(current, parentDepth + (current === entryActionId ? 1 : 0));
      }
    }

    const currentDepth = depthByNodeId.get(current) ?? 0;
    const targets = outgoingByNodeId.get(current) ?? [];

    for (const target of targets) {
      const nextDepth = currentDepth + 1;
      const prevDepth = depthByNodeId.get(target);
      if (prevDepth === undefined || nextDepth < prevDepth) {
        depthByNodeId.set(target, nextDepth);
      }
      if (!queue.includes(target)) {
        queue.push(target);
      }
    }
  }

  const maxDepth = Math.max(...depthByNodeId.values(), 0);

  for (const node of nodes) {
    if (!depthByNodeId.has(node.id)) {
      depthByNodeId.set(node.id, maxDepth + 1);
    }
  }

  return depthByNodeId;
}

function layoutNodes(
  nodes: FlowOverviewNode[],
  edges: Edge[],
  entryActionId: string | null,
): FlowOverviewNode[] {
  const depthByNodeId = buildNodeDepths(nodes, edges, entryActionId);
  const layerMap = new Map<number, FlowOverviewNode[]>();

  for (const node of nodes) {
    const depth = depthByNodeId.get(node.id) ?? 0;
    const layerNodes = layerMap.get(depth) ?? [];
    layerNodes.push(node);
    layerMap.set(depth, layerNodes);
  }

  const sortedDepths = [...layerMap.keys()].sort((a, b) => a - b);

  for (const depth of sortedDepths) {
    const layerNodes = layerMap.get(depth) ?? [];
    layerNodes.sort((a, b) => {
      if (a.data.kind !== b.data.kind) {
        const priority = {
          start: 0,
          action: 1,
          "branch-action": 2,
          completion: 3,
        } as const;

        return priority[a.data.kind] - priority[b.data.kind];
      }

      return a.data.title.localeCompare(b.data.title);
    });

    const offset = (layerNodes.length - 1) / 2;
    layerNodes.forEach((node, index) => {
      node.position = {
        x: (index - offset) * HORIZONTAL_GAP,
        y: depth * VERTICAL_GAP,
      };
    });
  }

  return nodes;
}

function toEdge(connection: EditorFlowConnection): Edge {
  return {
    id: connection.id,
    source: connection.source,
    target: connection.target,
    type: "default",
    label: connection.label ?? undefined,
    labelStyle: connection.label
      ? {
          fontSize: 11,
          fontWeight: 600,
          fill: "#71717a",
        }
      : undefined,
    style: {
      stroke: connection.isBranchOption ? "#a855f7" : "#64748b",
      strokeWidth: 2,
    },
  };
}

export function buildFlowOverviewSummary(analysis: EditorFlowAnalysisResult): FlowOverviewSummary {
  return {
    actionCount: analysis.state.actions.length,
    completionCount: analysis.state.completions.length,
    connectionCount: analysis.connections.length,
    missingEntryCount: analysis.issues.filter(issue => issue.type === "missing-entry").length,
    missingCompletionCount: analysis.issues.filter(issue => issue.type === "missing-completion")
      .length,
    unreachableCount: analysis.issues.filter(issue => issue.type === "unreachable").length,
    deadEndCount: analysis.issues.filter(issue => issue.type === "dead-end").length,
  };
}

export function buildFlowOverviewElements(
  analysis: EditorFlowAnalysisResult,
  options?: {
    compact?: boolean;
  },
): {
  nodes: FlowOverviewNode[];
  edges: Edge[];
} {
  const compact = Boolean(options?.compact);
  const deadEndNodeIds = buildIssueNodeSet(analysis, "dead-end");
  const unreachableNodeIds = buildIssueNodeSet(analysis, "unreachable");
  const hasMissingEntry = analysis.issues.some(issue => issue.type === "missing-entry");

  const nodes: FlowOverviewNode[] = [
    {
      id: START_NODE_ID,
      type: "overview-node",
      position: { x: 0, y: 0 },
      data: {
        title: "시작",
        subtitle: hasMissingEntry ? "시작 질문이 아직 설정되지 않았습니다" : "진입점",
        kind: "start" as const,
        compact,
        isUnreachable: false,
        isDeadEnd: false,
        isMissingEntry: hasMissingEntry,
      },
    },
    ...analysis.state.actions.map(action => {
      const isBranchAction = isBranchType(action.type);
      return {
        id: action.id,
        type: "overview-node",
        position: { x: 0, y: 0 },
        data: {
          title: action.title,
          subtitle: getActionTypeLabel(action.type),
          kind: (isBranchAction ? "branch-action" : "action") as FlowOverviewNodeKind,
          compact,
          isUnreachable: unreachableNodeIds.has(action.id),
          isDeadEnd: deadEndNodeIds.has(action.id),
          isMissingEntry: false,
        },
      };
    }),
    ...analysis.state.completions.map(completion => ({
      id: completion.id,
      type: "overview-node",
      position: { x: 0, y: 0 },
      data: {
        title: completion.title,
        subtitle: "완료 화면",
        kind: "completion" as const,
        compact,
        isUnreachable: unreachableNodeIds.has(completion.id),
        isDeadEnd: false,
        isMissingEntry: false,
      },
    })),
  ];

  const edges: Edge[] = [];

  if (analysis.state.entryActionId) {
    edges.push({
      id: `${START_NODE_ID}:${analysis.state.entryActionId}`,
      source: START_NODE_ID,
      target: analysis.state.entryActionId,
      type: "default",
      style: {
        stroke: "#0f172a",
        strokeWidth: 2,
      },
    });
  }

  edges.push(...analysis.connections.map(toEdge));

  return {
    nodes: layoutNodes(nodes, edges, analysis.state.entryActionId),
    edges,
  };
}
