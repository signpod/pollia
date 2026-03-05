import type {
  ServerActionLike,
  ServerCompletionLike,
  ValidateEditorPublishFlowInput,
} from "./editor-publish-flow-validation";

interface ResolveEditorDesktopFlowPolicyInput {
  isActive: boolean;
  entryActionId: string | null | undefined;
  useAiCompletion?: boolean;
  serverActions: ServerActionLike[] | null | undefined;
  serverCompletions: ServerCompletionLike[] | null | undefined;
  actionDraftSnapshot?: unknown;
  completionDraftSnapshot?: unknown;
}

function toSafeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export function resolveEditorDesktopFlowPolicy(
  input: ResolveEditorDesktopFlowPolicyInput,
): ValidateEditorPublishFlowInput {
  return {
    entryActionId: input.entryActionId ?? null,
    useAiCompletion: input.useAiCompletion === true,
    serverActions: toSafeArray(input.serverActions),
    serverCompletions: toSafeArray(input.serverCompletions),
    actionDraftSnapshot: input.actionDraftSnapshot ?? undefined,
    completionDraftSnapshot: input.completionDraftSnapshot ?? undefined,
  };
}
