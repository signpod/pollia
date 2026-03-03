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
  title: string | null;
  nextActionId: string | null;
  nextCompletionId: string | null;
}

export interface FlowAction {
  id: string;
  type: string;
  title: string;
  nextActionId: string | null;
  nextCompletionId: string | null;
  options: FlowOptionLink[];
  isDraft: boolean;
}

export interface FlowCompletion {
  id: string;
  title: string;
  isDraft: boolean;
}

export interface EditorFlowState {
  entryActionId: string | null;
  actions: FlowAction[];
  completions: FlowCompletion[];
}

export interface EditorFlowConnection {
  id: string;
  source: string;
  target: string;
  label: string | null;
  isBranchOption: boolean;
}

export interface EditorFlowAnalysisResult {
  state: EditorFlowState;
  issues: PublishFlowValidationIssue[];
  outgoingByActionId: Map<string, string[]>;
  reachableNodeIds: Set<string>;
  connections: EditorFlowConnection[];
}

interface ServerActionLike {
  id: string;
  type: string;
  title: string;
  nextActionId: string | null;
  nextCompletionId: string | null;
  options: Array<{
    title: string | null;
    nextActionId: string | null;
    nextCompletionId: string | null;
  }>;
}

interface ServerCompletionLike {
  id: string;
  title: string | null;
}

interface ActionSnapshotLink {
  title: string | null;
  nextActionId: string | null;
  nextCompletionId: string | null;
}

interface ParsedActionFormSnapshot {
  actionType: string | null;
  title: string | null;
  nextActionId: string | null;
  nextCompletionId: string | null;
  options: ActionSnapshotLink[];
}

interface ParsedActionDraftSnapshot {
  draftKeys: string[];
  formSnapshotsByItemKey: Record<string, ParsedActionFormSnapshot>;
}

interface ParsedCompletionFormSnapshot {
  title: string | null;
}

interface ParsedCompletionDraftSnapshot {
  draftKeys: string[];
  draftTitleByKey: Record<string, string>;
  removedExistingIds: Set<string>;
  formSnapshotsByItemKey: Record<string, ParsedCompletionFormSnapshot>;
}

export interface ValidateEditorPublishFlowInput {
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

  return value.flatMap(item => {
    if (!isRecord(item)) {
      return [];
    }

    return [
      {
        title: toNullableString(item.title),
        nextActionId: toNullableString(item.nextActionId),
        nextCompletionId: toNullableString(item.nextCompletionId),
      },
    ];
  });
}

function parseActionFormSnapshot(value: unknown): ParsedActionFormSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  const values = isRecord(value.values) ? value.values : {};

  return {
    actionType: toNullableString(value.actionType),
    title: toNullableString(values.title),
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

function parseCompletionFormSnapshot(value: unknown): ParsedCompletionFormSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    title: toNullableString(value.title),
  };
}

function parseCompletionDraftSnapshot(snapshot: unknown): ParsedCompletionDraftSnapshot {
  if (!isRecord(snapshot)) {
    return {
      draftKeys: [],
      draftTitleByKey: {},
      removedExistingIds: new Set<string>(),
      formSnapshotsByItemKey: {},
    };
  }

  const draftTitleByKey: Record<string, string> = {};
  const draftKeys = Array.isArray(snapshot.draftItems)
    ? snapshot.draftItems.flatMap(item => {
        if (!isRecord(item)) {
          return [];
        }

        const key = toNullableString(item.key);
        if (!key) {
          return [];
        }

        const title = toNullableString(item.title);
        if (title) {
          draftTitleByKey[key] = title;
        }

        return [key];
      })
    : [];

  const removedExistingIds = new Set<string>(
    Array.isArray(snapshot.removedExistingIds)
      ? snapshot.removedExistingIds
          .map(id => toNullableString(id))
          .filter((id): id is string => Boolean(id))
      : [],
  );

  const rawFormSnapshots = isRecord(snapshot.formSnapshotByItemKey)
    ? snapshot.formSnapshotByItemKey
    : {};
  const formSnapshotsByItemKey: Record<string, ParsedCompletionFormSnapshot> = {};

  for (const [itemKey, value] of Object.entries(rawFormSnapshots)) {
    const parsed = parseCompletionFormSnapshot(value);
    if (parsed) {
      formSnapshotsByItemKey[itemKey] = parsed;
    }
  }

  return {
    draftKeys,
    draftTitleByKey,
    removedExistingIds,
    formSnapshotsByItemKey,
  };
}

function toFlowActionFromServer(action: ServerActionLike): FlowAction {
  return {
    id: action.id,
    type: action.type,
    title: action.title || "제목 없는 액션",
    nextActionId: action.nextActionId ?? null,
    nextCompletionId: action.nextCompletionId ?? null,
    options: (action.options ?? []).map((option, index) => ({
      title: option.title?.trim() || `옵션 ${index + 1}`,
      nextActionId: option.nextActionId ?? null,
      nextCompletionId: option.nextCompletionId ?? null,
    })),
    isDraft: false,
  };
}

function toFlowActionFromSnapshot(
  actionId: string,
  snapshot: ParsedActionFormSnapshot,
  isDraft: boolean,
): FlowAction {
  return {
    id: actionId,
    type: snapshot.actionType ?? "SUBJECTIVE",
    title: snapshot.title ?? (isDraft ? "임시 액션" : "제목 없는 액션"),
    nextActionId: snapshot.nextActionId,
    nextCompletionId: snapshot.nextCompletionId,
    options: snapshot.options.map((option, index) => ({
      title: option.title ?? `옵션 ${index + 1}`,
      nextActionId: option.nextActionId,
      nextCompletionId: option.nextCompletionId,
    })),
    isDraft,
  };
}

export function buildEditorFlowState({
  entryActionId,
  serverActions,
  serverCompletions,
  actionDraftSnapshot,
  completionDraftSnapshot,
}: ValidateEditorPublishFlowInput): EditorFlowState {
  const parsedActionSnapshot = parseActionDraftSnapshot(actionDraftSnapshot);
  const parsedCompletionSnapshot = parseCompletionDraftSnapshot(completionDraftSnapshot);
  const normalizedEntryActionId = toNullableString(entryActionId);

  const completionById = new Map<string, FlowCompletion>();
  for (const completion of serverCompletions) {
    if (parsedCompletionSnapshot.removedExistingIds.has(completion.id)) {
      continue;
    }

    const existingItemKey = `existing:${completion.id}`;
    const snapshot = parsedCompletionSnapshot.formSnapshotsByItemKey[existingItemKey];

    completionById.set(completion.id, {
      id: completion.id,
      title: snapshot?.title ?? completion.title ?? "완료 화면",
      isDraft: false,
    });
  }

  for (const draftKey of parsedCompletionSnapshot.draftKeys) {
    const draftCompletionId = makeDraftCompletionId(draftKey);
    const draftItemKey = `draft:${draftKey}`;
    const snapshot = parsedCompletionSnapshot.formSnapshotsByItemKey[draftItemKey];

    completionById.set(draftCompletionId, {
      id: draftCompletionId,
      title:
        snapshot?.title ?? parsedCompletionSnapshot.draftTitleByKey[draftKey] ?? "임시 완료 화면",
      isDraft: true,
    });
  }

  const actionById = new Map<string, FlowAction>();
  for (const action of serverActions) {
    const existingItemKey = `existing:${action.id}`;
    const snapshot = parsedActionSnapshot.formSnapshotsByItemKey[existingItemKey];

    actionById.set(
      action.id,
      snapshot
        ? toFlowActionFromSnapshot(action.id, snapshot, false)
        : toFlowActionFromServer(action),
    );
  }

  for (const draftKey of parsedActionSnapshot.draftKeys) {
    const draftActionId = `draft:${draftKey}`;
    const draftItemKey = `draft:${draftKey}`;
    const snapshot = parsedActionSnapshot.formSnapshotsByItemKey[draftItemKey];

    actionById.set(
      draftActionId,
      snapshot
        ? toFlowActionFromSnapshot(draftActionId, snapshot, true)
        : {
            id: draftActionId,
            type: "SUBJECTIVE",
            title: "임시 액션",
            nextActionId: null,
            nextCompletionId: null,
            options: [],
            isDraft: true,
          },
    );
  }

  return {
    entryActionId: normalizedEntryActionId,
    actions: [...actionById.values()],
    completions: [...completionById.values()],
  };
}

function isBranchAction(actionType: string): boolean {
  return actionType.toUpperCase() === "BRANCH";
}

export function buildEditorFlowConnections(state: EditorFlowState): EditorFlowConnection[] {
  const actionIdSet = new Set(state.actions.map(action => action.id));
  const completionIdSet = new Set(state.completions.map(completion => completion.id));
  const nodeIdSet = new Set<string>([...actionIdSet, ...completionIdSet]);
  const connections: EditorFlowConnection[] = [];

  const appendConnection = ({
    id,
    source,
    target,
    label,
    isBranchOption,
  }: EditorFlowConnection) => {
    if (!target || !nodeIdSet.has(target)) {
      return;
    }

    connections.push({
      id,
      source,
      target,
      label,
      isBranchOption,
    });
  };

  for (const action of state.actions) {
    if (isBranchAction(action.type) && action.options.length > 0) {
      action.options.forEach((option, index) => {
        const optionLabel = option.title || `옵션 ${index + 1}`;
        if (option.nextActionId) {
          appendConnection({
            id: `${action.id}:option:${index}:action:${option.nextActionId}`,
            source: action.id,
            target: option.nextActionId,
            label: optionLabel,
            isBranchOption: true,
          });
        }

        if (option.nextCompletionId) {
          appendConnection({
            id: `${action.id}:option:${index}:completion:${option.nextCompletionId}`,
            source: action.id,
            target: option.nextCompletionId,
            label: optionLabel,
            isBranchOption: true,
          });
        }
      });
      continue;
    }

    if (action.nextActionId) {
      appendConnection({
        id: `${action.id}:action:${action.nextActionId}`,
        source: action.id,
        target: action.nextActionId,
        label: null,
        isBranchOption: false,
      });
    }
    if (action.nextCompletionId) {
      appendConnection({
        id: `${action.id}:completion:${action.nextCompletionId}`,
        source: action.id,
        target: action.nextCompletionId,
        label: null,
        isBranchOption: false,
      });
    }
  }

  return connections;
}

function buildOutgoingByActionId(
  actions: FlowAction[],
  connections: EditorFlowConnection[],
): Map<string, string[]> {
  const outgoingByActionId = new Map<string, string[]>(
    actions.map(action => [action.id, [] as string[]]),
  );

  for (const connection of connections) {
    if (!outgoingByActionId.has(connection.source)) {
      continue;
    }

    const outgoing = outgoingByActionId.get(connection.source);
    if (!outgoing || outgoing.includes(connection.target)) {
      continue;
    }

    outgoing.push(connection.target);
  }

  return outgoingByActionId;
}

export function analyzeEditorFlow(input: ValidateEditorPublishFlowInput): EditorFlowAnalysisResult {
  const issues: PublishFlowValidationIssue[] = [];
  const state = buildEditorFlowState(input);

  const actionIdSet = new Set(state.actions.map(action => action.id));
  const connections = buildEditorFlowConnections(state);
  const outgoingByActionId = buildOutgoingByActionId(state.actions, connections);

  const reachableNodeIds = new Set<string>([START_NODE_ID]);
  const queue: string[] = [];

  if (!state.entryActionId || !actionIdSet.has(state.entryActionId)) {
    issues.push({
      type: "missing-entry",
      nodeId: START_NODE_ID,
      message: "시작 액션이 설정되지 않았습니다",
    });
  } else {
    queue.push(state.entryActionId);
  }

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || reachableNodeIds.has(currentId)) {
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

  for (const action of state.actions) {
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

  for (const completion of state.completions) {
    if (!reachableNodeIds.has(completion.id)) {
      issues.push({
        type: "unreachable",
        nodeId: completion.id,
        message: "시작점에서 도달할 수 없는 결과 화면이 있습니다",
      });
    }
  }

  return {
    state,
    issues,
    outgoingByActionId,
    reachableNodeIds,
    connections,
  };
}

export function validateEditorPublishFlow(
  input: ValidateEditorPublishFlowInput,
): PublishFlowValidationResult {
  const analysis = analyzeEditorFlow(input);

  return {
    isValid: analysis.issues.length === 0,
    issues: analysis.issues,
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
