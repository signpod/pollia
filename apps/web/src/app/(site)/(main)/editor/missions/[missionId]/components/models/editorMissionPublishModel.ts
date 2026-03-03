import {
  type PublishFlowValidationIssue,
  type ServerActionLike,
  type ServerCompletionLike,
  getPublishBlockingMessage,
  validateEditorPublishFlow,
} from "../editor-publish-flow-validation";

export interface ResolvedEntryAction {
  entryActionId: string | null;
  source: "order" | "server" | "none";
  candidateFromOrder: string | null;
}

export interface PublishComputationInput {
  isPublished: boolean;
  entryActionId: string | null | undefined;
  serverActions: ServerActionLike[] | null | undefined;
  serverCompletions: ServerCompletionLike[] | null | undefined;
  actionDraftSnapshot?: unknown;
  completionDraftSnapshot?: unknown;
}

export interface PublishAvailability {
  canPublish: boolean;
  isValidationDataReady: boolean;
  issues: PublishFlowValidationIssue[];
  blockingMessage: string | null;
  debug: {
    resolvedEntryActionId: string | null;
    entrySource: ResolvedEntryAction["source"];
    hasServerActions: boolean;
    hasServerCompletions: boolean;
    issueCount: number;
  };
}

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

function resolveActionIdFromItemKey(itemKey: string): string | null {
  if (itemKey.startsWith("existing:")) {
    return toNullableString(itemKey.slice("existing:".length));
  }

  if (itemKey.startsWith("draft:")) {
    return toNullableString(itemKey);
  }

  return null;
}

function parseActionSnapshotMeta(snapshot: unknown): {
  draftActionIds: Set<string>;
  itemOrderKeys: string[];
} {
  if (!isRecord(snapshot)) {
    return {
      draftActionIds: new Set<string>(),
      itemOrderKeys: [],
    };
  }

  const draftActionIds = new Set<string>(
    Array.isArray(snapshot.draftItems)
      ? snapshot.draftItems
          .map(item => (isRecord(item) ? toNullableString(item.key) : null))
          .filter((key): key is string => Boolean(key))
          .map(key => `draft:${key}`)
      : [],
  );

  const itemOrderKeys = Array.isArray(snapshot.itemOrderKeys)
    ? snapshot.itemOrderKeys
        .map(key => toNullableString(key))
        .filter((key): key is string => Boolean(key))
    : [];

  return {
    draftActionIds,
    itemOrderKeys,
  };
}

export function resolveEntryActionIdForPublish(input: {
  entryActionId: string | null | undefined;
  serverActions: ServerActionLike[] | null | undefined;
  actionDraftSnapshot?: unknown;
}): ResolvedEntryAction {
  const normalizedServerEntryActionId = toNullableString(input.entryActionId);
  const serverActions = Array.isArray(input.serverActions) ? input.serverActions : [];
  const { draftActionIds, itemOrderKeys } = parseActionSnapshotMeta(input.actionDraftSnapshot);

  const actionIdSet = new Set<string>([
    ...serverActions.map(action => action.id),
    ...draftActionIds.values(),
  ]);

  for (const itemKey of itemOrderKeys) {
    const candidate = resolveActionIdFromItemKey(itemKey);
    if (!candidate) {
      continue;
    }

    if (actionIdSet.has(candidate)) {
      return {
        entryActionId: candidate,
        source: "order",
        candidateFromOrder: candidate,
      };
    }
  }

  if (normalizedServerEntryActionId) {
    return {
      entryActionId: normalizedServerEntryActionId,
      source: "server",
      candidateFromOrder: null,
    };
  }

  return {
    entryActionId: null,
    source: "none",
    candidateFromOrder: null,
  };
}

export function buildPublishValidationInput(input: {
  entryActionId: string | null | undefined;
  serverActions: ServerActionLike[] | null | undefined;
  serverCompletions: ServerCompletionLike[] | null | undefined;
  actionDraftSnapshot?: unknown;
  completionDraftSnapshot?: unknown;
}) {
  const resolvedEntry = resolveEntryActionIdForPublish({
    entryActionId: input.entryActionId,
    serverActions: input.serverActions,
    actionDraftSnapshot: input.actionDraftSnapshot,
  });

  return {
    entryActionId: resolvedEntry.entryActionId,
    serverActions: Array.isArray(input.serverActions) ? input.serverActions : [],
    serverCompletions: Array.isArray(input.serverCompletions) ? input.serverCompletions : [],
    actionDraftSnapshot: input.actionDraftSnapshot,
    completionDraftSnapshot: input.completionDraftSnapshot,
    resolvedEntry,
  };
}

export function computePublishAvailability(input: PublishComputationInput): PublishAvailability {
  const isValidationDataReady =
    Array.isArray(input.serverActions) && Array.isArray(input.serverCompletions);

  const validationInput = buildPublishValidationInput({
    entryActionId: input.entryActionId,
    serverActions: input.serverActions,
    serverCompletions: input.serverCompletions,
    actionDraftSnapshot: input.actionDraftSnapshot,
    completionDraftSnapshot: input.completionDraftSnapshot,
  });

  if (!isValidationDataReady) {
    return {
      canPublish: false,
      isValidationDataReady,
      issues: [],
      blockingMessage: null,
      debug: {
        resolvedEntryActionId: validationInput.resolvedEntry.entryActionId,
        entrySource: validationInput.resolvedEntry.source,
        hasServerActions: Array.isArray(input.serverActions),
        hasServerCompletions: Array.isArray(input.serverCompletions),
        issueCount: 0,
      },
    };
  }

  const validationResult = validateEditorPublishFlow({
    entryActionId: validationInput.entryActionId,
    serverActions: validationInput.serverActions,
    serverCompletions: validationInput.serverCompletions,
    actionDraftSnapshot: validationInput.actionDraftSnapshot,
    completionDraftSnapshot: validationInput.completionDraftSnapshot,
  });

  return {
    canPublish: !input.isPublished && validationResult.isValid,
    isValidationDataReady,
    issues: validationResult.issues,
    blockingMessage: validationResult.isValid
      ? null
      : getPublishBlockingMessage(validationResult.issues),
    debug: {
      resolvedEntryActionId: validationInput.resolvedEntry.entryActionId,
      entrySource: validationInput.resolvedEntry.source,
      hasServerActions: true,
      hasServerCompletions: true,
      issueCount: validationResult.issues.length,
    },
  };
}
