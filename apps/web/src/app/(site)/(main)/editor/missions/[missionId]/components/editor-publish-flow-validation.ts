import { makeDraftCompletionId } from "./EditorMissionDraftContext";

export type PublishFlowIssueType = "missing-entry" | "unreachable" | "dead-end";

export interface PublishFlowValidationIssue {
  type: PublishFlowIssueType;
  nodeId: string;
  message: string;
}

export interface PublishFlowValidationResult {
  isValid: boolean;
  issues: PublishFlowValidationIssue[];
}

interface FlowOptionLink {
  nextActionId: string | null;
  nextCompletionId: string | null;
}

interface FlowAction {
  id: string;
  type: string;
  nextActionId: string | null;
  nextCompletionId: string | null;
  options: FlowOptionLink[];
}

interface FlowCompletion {
  id: string;
}

interface ServerActionLike {
  id: string;
  type: string;
  nextActionId: string | null;
  nextCompletionId: string | null;
  options: Array<{
    nextActionId: string | null;
    nextCompletionId: string | null;
  }>;
}

interface ServerCompletionLike {
  id: string;
}

interface ActionSnapshotLink {
  nextActionId: string | null;
  nextCompletionId: string | null;
}

interface ParsedActionFormSnapshot {
  actionType: string | null;
  nextActionId: string | null;
  nextCompletionId: string | null;
  options: ActionSnapshotLink[];
}

interface ParsedActionDraftSnapshot {
  draftKeys: string[];
  formSnapshotsByItemKey: Record<string, ParsedActionFormSnapshot>;
}

interface ParsedCompletionDraftSnapshot {
  draftKeys: string[];
  removedExistingIds: Set<string>;
}

interface ValidateEditorPublishFlowInput {
  entryActionId: string | null | undefined;
  serverActions: ServerActionLike[];
  serverCompletions: ServerCompletionLike[];
  actionDraftSnapshot?: unknown;
  completionDraftSnapshot?: unknown;
}

const START_NODE_ID = "start";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionLinks(value: unknown): ActionSnapshotLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      if (!isRecord(item)) {
        return null;
      }

      return {
        nextActionId: toNullableString(item.nextActionId),
        nextCompletionId: toNullableString(item.nextCompletionId),
      };
    })
    .filter((item): item is ActionSnapshotLink => Boolean(item));
}

function parseActionFormSnapshot(value: unknown): ParsedActionFormSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  const values = isRecord(value.values) ? value.values : {};

  return {
    actionType: toNullableString(value.actionType),
    nextActionId: toNullableString(values.nextActionId),
    nextCompletionId: toNullableString(values.nextCompletionId),
    options: parseOptionLinks(values.options),
  };
}

function parseActionDraftSnapshot(snapshot: unknown): ParsedActionDraftSnapshot {
  if (!isRecord(snapshot)) {
    return { draftKeys: [], formSnapshotsByItemKey: {} };
  }

  const draftKeys = Array.isArray(snapshot.draftItems)
    ? snapshot.draftItems
        .map(item => (isRecord(item) ? toNullableString(item.key) : null))
        .filter((key): key is string => Boolean(key))
    : [];

  const rawFormSnapshots = isRecord(snapshot.formSnapshotByItemKey)
    ? snapshot.formSnapshotByItemKey
    : {};
  const formSnapshotsByItemKey: Record<string, ParsedActionFormSnapshot> = {};

  for (const [itemKey, value] of Object.entries(rawFormSnapshots)) {
    const parsed = parseActionFormSnapshot(value);
    if (parsed) {
      formSnapshotsByItemKey[itemKey] = parsed;
    }
  }

  return {
    draftKeys,
    formSnapshotsByItemKey,
  };
}

function parseCompletionDraftSnapshot(snapshot: unknown): ParsedCompletionDraftSnapshot {
  if (!isRecord(snapshot)) {
    return { draftKeys: [], removedExistingIds: new Set<string>() };
  }

  const draftKeys = Array.isArray(snapshot.draftItems)
    ? snapshot.draftItems
        .map(item => (isRecord(item) ? toNullableString(item.key) : null))
        .filter((key): key is string => Boolean(key))
    : [];

  const removedExistingIds = new Set<string>(
    Array.isArray(snapshot.removedExistingIds)
      ? snapshot.removedExistingIds
          .map(id => toNullableString(id))
          .filter((id): id is string => Boolean(id))
      : [],
  );

  return {
    draftKeys,
    removedExistingIds,
  };
}

function toFlowActionFromServer(action: ServerActionLike): FlowAction {
  return {
    id: action.id,
    type: action.type,
    nextActionId: action.nextActionId ?? null,
    nextCompletionId: action.nextCompletionId ?? null,
    options: (action.options ?? []).map(option => ({
      nextActionId: option.nextActionId ?? null,
      nextCompletionId: option.nextCompletionId ?? null,
    })),
  };
}

function toFlowActionFromSnapshot(
  actionId: string,
  snapshot: ParsedActionFormSnapshot,
): FlowAction {
  return {
    id: actionId,
    type: snapshot.actionType ?? "SUBJECTIVE",
    nextActionId: snapshot.nextActionId,
    nextCompletionId: snapshot.nextCompletionId,
    options: snapshot.options,
  };
}

function buildFlowState({
  serverActions,
  serverCompletions,
  actionDraftSnapshot,
  completionDraftSnapshot,
}: {
  serverActions: ServerActionLike[];
  serverCompletions: ServerCompletionLike[];
  actionDraftSnapshot?: unknown;
  completionDraftSnapshot?: unknown;
}): {
  actions: FlowAction[];
  completions: FlowCompletion[];
} {
  const parsedActionSnapshot = parseActionDraftSnapshot(actionDraftSnapshot);
  const parsedCompletionSnapshot = parseCompletionDraftSnapshot(completionDraftSnapshot);

  const completionIdSet = new Set<string>();
  const completions: FlowCompletion[] = [];

  for (const completion of serverCompletions) {
    if (parsedCompletionSnapshot.removedExistingIds.has(completion.id)) {
      continue;
    }

    if (!completionIdSet.has(completion.id)) {
      completionIdSet.add(completion.id);
      completions.push({ id: completion.id });
    }
  }

  for (const draftKey of parsedCompletionSnapshot.draftKeys) {
    const draftCompletionId = makeDraftCompletionId(draftKey);
    if (!completionIdSet.has(draftCompletionId)) {
      completionIdSet.add(draftCompletionId);
      completions.push({ id: draftCompletionId });
    }
  }

  const actions = serverActions.map(action => {
    const existingItemKey = `existing:${action.id}`;
    const snapshot = parsedActionSnapshot.formSnapshotsByItemKey[existingItemKey];
    if (!snapshot) {
      return toFlowActionFromServer(action);
    }

    return toFlowActionFromSnapshot(action.id, snapshot);
  });

  for (const draftKey of parsedActionSnapshot.draftKeys) {
    const draftActionId = `draft:${draftKey}`;
    const draftItemKey = `draft:${draftKey}`;
    const snapshot = parsedActionSnapshot.formSnapshotsByItemKey[draftItemKey];

    if (snapshot) {
      actions.push(toFlowActionFromSnapshot(draftActionId, snapshot));
      continue;
    }

    actions.push({
      id: draftActionId,
      type: "SUBJECTIVE",
      nextActionId: null,
      nextCompletionId: null,
      options: [],
    });
  }

  return {
    actions,
    completions,
  };
}

function isBranchAction(actionType: string): boolean {
  return actionType.toUpperCase() === "BRANCH";
}

function collectOutgoingTargets(action: FlowAction, nodeIdSet: Set<string>): string[] {
  const rawTargets =
    isBranchAction(action.type) && action.options.length > 0
      ? action.options.flatMap(option => [option.nextActionId, option.nextCompletionId])
      : [action.nextActionId, action.nextCompletionId];

  const uniqueTargets = new Set<string>();

  for (const target of rawTargets) {
    if (!target) {
      continue;
    }

    if (nodeIdSet.has(target)) {
      uniqueTargets.add(target);
    }
  }

  return [...uniqueTargets];
}

export function validateEditorPublishFlow({
  entryActionId,
  serverActions,
  serverCompletions,
  actionDraftSnapshot,
  completionDraftSnapshot,
}: ValidateEditorPublishFlowInput): PublishFlowValidationResult {
  const issues: PublishFlowValidationIssue[] = [];
  const { actions, completions } = buildFlowState({
    serverActions,
    serverCompletions,
    actionDraftSnapshot,
    completionDraftSnapshot,
  });

  const actionIdSet = new Set(actions.map(action => action.id));
  const completionIdSet = new Set(completions.map(completion => completion.id));
  const allNodeIds = new Set<string>([...actionIdSet, ...completionIdSet, START_NODE_ID]);
  const normalizedEntryActionId = toNullableString(entryActionId);

  if (!normalizedEntryActionId || !actionIdSet.has(normalizedEntryActionId)) {
    issues.push({
      type: "missing-entry",
      nodeId: START_NODE_ID,
      message: "시작 액션이 설정되지 않았습니다",
    });
  }

  const outgoingByActionId = new Map<string, string[]>();
  for (const action of actions) {
    outgoingByActionId.set(action.id, collectOutgoingTargets(action, allNodeIds));
  }

  const reachableNodeIds = new Set<string>([START_NODE_ID]);
  const queue: string[] = [];

  if (normalizedEntryActionId && actionIdSet.has(normalizedEntryActionId)) {
    queue.push(normalizedEntryActionId);
  }

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) {
      continue;
    }

    if (reachableNodeIds.has(currentId)) {
      continue;
    }

    reachableNodeIds.add(currentId);

    const outgoing = outgoingByActionId.get(currentId);
    if (!outgoing) {
      continue;
    }

    for (const nextId of outgoing) {
      if (!reachableNodeIds.has(nextId)) {
        queue.push(nextId);
      }
    }
  }

  for (const action of actions) {
    if (!reachableNodeIds.has(action.id)) {
      issues.push({
        type: "unreachable",
        nodeId: action.id,
        message: "시작점에서 도달할 수 없는 액션이 있습니다",
      });
      continue;
    }

    const outgoing = outgoingByActionId.get(action.id) ?? [];
    if (outgoing.length === 0) {
      issues.push({
        type: "dead-end",
        nodeId: action.id,
        message: "다음 단계가 연결되지 않은 액션이 있습니다",
      });
    }
  }

  for (const completion of completions) {
    if (!reachableNodeIds.has(completion.id)) {
      issues.push({
        type: "unreachable",
        nodeId: completion.id,
        message: "시작점에서 도달할 수 없는 결과 화면이 있습니다",
      });
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

export function getPublishBlockingMessage(issues: PublishFlowValidationIssue[]): string {
  if (issues.some(issue => issue.type === "missing-entry")) {
    return "시작 액션이 설정되지 않아 발행할 수 없습니다.";
  }

  if (issues.some(issue => issue.type === "dead-end")) {
    return "다음 단계가 연결되지 않은 액션이 있어 발행할 수 없습니다.";
  }

  if (issues.some(issue => issue.type === "unreachable")) {
    return "도달할 수 없는 액션 또는 결과 화면이 있어 발행할 수 없습니다.";
  }

  return "발행 가능한 상태인지 확인할 수 없습니다.";
}
