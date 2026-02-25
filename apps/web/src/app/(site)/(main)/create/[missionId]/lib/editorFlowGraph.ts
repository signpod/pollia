import type { Edge, Node } from "@xyflow/react";
import type { PreviewAction, PreviewCompletion, PreviewMission } from "../context/EditorContext";

const _NODE_WIDTH = 160;
const NODE_HEIGHT = 56;
const GAP = 24;

function createStartNode(x: number, y: number): Node {
  return {
    id: "start",
    type: "start",
    position: { x, y },
    data: {},
  };
}

function createActionNode(action: PreviewAction, x: number, y: number): Node {
  return {
    id: action.id,
    type: "action",
    position: { x, y },
    data: { label: action.title || "질문", action },
  };
}

function createCompletionNode(completion: PreviewCompletion, x: number, y: number): Node {
  return {
    id: completion.id,
    type: "completion",
    position: { x, y },
    data: { label: completion.title, completion },
  };
}

export function buildEditorFlowGraph(
  mission: PreviewMission | null,
  actions: PreviewAction[],
  completions: PreviewCompletion[],
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const actionMap = new Map(actions.map(a => [a.id, a]));
  const completionMap = new Map(completions.map(c => [c.id, c]));

  let y = 0;
  const startNode = createStartNode(0, y);
  nodes.push(startNode);
  y += NODE_HEIGHT + GAP;

  const entryId = mission?.entryActionId ?? actions[0]?.id;
  if (entryId && actionMap.has(entryId)) {
    edges.push({ id: "start-entry", source: "start", target: entryId });
  }

  const visited = new Set<string>();
  const queue = entryId ? [entryId] : [...actions.map(a => a.id)];

  while (queue.length > 0) {
    const id = queue.shift();
    if (!id || visited.has(id)) continue;
    visited.add(id);

    const action = actionMap.get(id);
    const completion = completionMap.get(id);

    if (action) {
      const node = createActionNode(action, 0, y);
      nodes.push(node);
      y += NODE_HEIGHT + GAP;

      if (action.nextActionId && !visited.has(action.nextActionId)) {
        edges.push({ id: `${action.id}-next`, source: action.id, target: action.nextActionId });
        queue.push(action.nextActionId);
      }
      if (action.nextCompletionId && !visited.has(action.nextCompletionId)) {
        edges.push({
          id: `${action.id}-comp`,
          source: action.id,
          target: action.nextCompletionId,
        });
        queue.push(action.nextCompletionId);
      }
      for (const opt of action.options) {
        if (opt.nextActionId && !visited.has(opt.nextActionId)) {
          edges.push({
            id: `${action.id}-opt-${opt.id}-action`,
            source: action.id,
            target: opt.nextActionId,
          });
          queue.push(opt.nextActionId);
        }
        if (opt.nextCompletionId && !visited.has(opt.nextCompletionId)) {
          edges.push({
            id: `${action.id}-opt-${opt.id}-comp`,
            source: action.id,
            target: opt.nextCompletionId,
          });
          queue.push(opt.nextCompletionId);
        }
      }
    } else if (completion) {
      const node = createCompletionNode(completion, 0, y);
      nodes.push(node);
      y += NODE_HEIGHT + GAP;
    }
  }

  completions.forEach(c => {
    if (!visited.has(c.id)) {
      nodes.push(createCompletionNode(c, 0, y));
      y += NODE_HEIGHT + GAP;
    }
  });

  return { nodes, edges };
}
