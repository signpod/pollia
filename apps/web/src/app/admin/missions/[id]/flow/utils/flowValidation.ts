import type { Edge, Node } from "@xyflow/react";

export interface ValidationError {
  type: "unreachable" | "dead-end" | "missing-entry";
  nodeId: string;
  message: string;
}

export interface ValidationResult {
  errors: ValidationError[];
  isValid: boolean;
  unreachableNodes: Set<string>;
  deadEndNodes: Set<string>;
}

export function validateFlowGraph(nodes: Node[], edges: Edge[]): ValidationResult {
  const errors: ValidationError[] = [];
  const unreachableNodes = new Set<string>();
  const deadEndNodes = new Set<string>();

  const startNode = nodes.find(n => n.id === "start");
  if (!startNode) {
    return {
      errors: [
        {
          type: "missing-entry",
          nodeId: "start",
          message: "시작 노드가 없습니다",
        },
      ],
      isValid: false,
      unreachableNodes,
      deadEndNodes,
    };
  }

  const hasEntryAction = edges.some(e => e.source === "start");
  if (!hasEntryAction) {
    errors.push({
      type: "missing-entry",
      nodeId: "start",
      message: "시작 질문이 설정되지 않았습니다",
    });
  }

  const reachableNodes = new Set<string>(["start"]);
  const queue: string[] = ["start"];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) break;
    const outgoingEdges = edges.filter(e => e.source === currentId);

    outgoingEdges.forEach(edge => {
      if (!reachableNodes.has(edge.target)) {
        reachableNodes.add(edge.target);
        queue.push(edge.target);
      }
    });
  }

  nodes.forEach(node => {
    if (node.id === "start") return;

    if (!reachableNodes.has(node.id)) {
      unreachableNodes.add(node.id);
      errors.push({
        type: "unreachable",
        nodeId: node.id,
        message: "이 노드는 시작점에서 도달할 수 없습니다",
      });
    }

    if (node.type === "action" || node.type === "branch-action") {
      const hasOutgoing = edges.some(e => e.source === node.id);
      if (!hasOutgoing) {
        deadEndNodes.add(node.id);
        errors.push({
          type: "dead-end",
          nodeId: node.id,
          message: "다음 단계가 설정되지 않았습니다",
        });
      }
    }
  });

  return {
    errors,
    isValid: errors.length === 0,
    unreachableNodes,
    deadEndNodes,
  };
}
