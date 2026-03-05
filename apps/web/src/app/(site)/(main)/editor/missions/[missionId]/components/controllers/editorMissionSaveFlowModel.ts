import type { SectionSaveSummary } from "./editorMissionSaveSummaryModel";

// ---------------------------------------------------------------------------
// Guard Inputs
// ---------------------------------------------------------------------------

export interface UnifiedSaveGuardInput {
  isEditorTab: boolean;
  saveInFlight: boolean;
  isSavingAll: boolean;
  hasAnyBusySection: boolean;
}

export interface SaveGuardInput {
  isValidationDataReady: boolean;
  issueCount: number;
  blockingMessage: string | null;
}

export interface PublishGuardInput {
  isEditorTab: boolean;
  isPublished: boolean;
  publishInFlight: boolean;
  isPublishing: boolean;
  isSavingAll: boolean;
  hasAnyBusySection: boolean;
  canPublish: boolean;
  isValidationDataReady: boolean;
  issueCount: number;
  blockingMessage: string | null;
}

// ---------------------------------------------------------------------------
// Guard Results (discriminated unions)
// ---------------------------------------------------------------------------

export type UnifiedSaveGuardResult = { allowed: true } | { allowed: false };

export type SaveGuardResult = { allowed: true } | { allowed: false; message: string };

export type PublishGuardResult =
  | { allowed: true }
  | { allowed: false; silent: true }
  | { allowed: false; silent: false; message: string };

// ---------------------------------------------------------------------------
// Outcome Inputs
// ---------------------------------------------------------------------------

export interface DraftClearOutcomeInput {
  serverDraftCleared: boolean;
  localDraftCleared: boolean;
}

export interface PostSectionSaveInput {
  mode: "manual" | "publish";
  summary: SectionSaveSummary;
  showSavedToast: boolean;
  showNoChangesToast: boolean;
}

// ---------------------------------------------------------------------------
// Outcome Results (discriminated unions)
// ---------------------------------------------------------------------------

export type NoChangesOutcome = { type: "clear_failed" } | { type: "cleared" };

export type UnifiedSaveResult = "saved" | "no_changes" | "failed";

export type PostSectionSaveOutcome =
  | { type: "publish_error"; message: string; result: "failed" }
  | { type: "manual_with_failures"; message: string; result: "failed" }
  | {
      type: "manual_processed";
      message: string;
      shouldClearDraft: boolean;
      showToast: boolean;
      result: "saved" | "no_changes";
    }
  | { type: "saved"; shouldClearDraft: boolean; showToast: boolean; result: "saved" }
  | { type: "no_changes"; showToast: boolean; result: "no_changes" };

// ---------------------------------------------------------------------------
// Guard Functions
// ---------------------------------------------------------------------------

export function checkUnifiedSaveGuard(input: UnifiedSaveGuardInput): UnifiedSaveGuardResult {
  if (!input.isEditorTab || input.saveInFlight || input.isSavingAll || input.hasAnyBusySection) {
    return { allowed: false };
  }

  return { allowed: true };
}

export function checkSaveGuard(input: SaveGuardInput): SaveGuardResult {
  const isCheckingState = !input.isValidationDataReady || input.issueCount === 0;

  if (!input.isValidationDataReady || input.issueCount > 0) {
    return {
      allowed: false,
      message: isCheckingState
        ? "저장 가능 상태를 확인 중입니다. 잠시 후 다시 시도해주세요."
        : (input.blockingMessage ?? "저장 가능한 상태인지 확인할 수 없습니다."),
    };
  }

  return { allowed: true };
}

export function checkPublishGuard(input: PublishGuardInput): PublishGuardResult {
  if (
    !input.isEditorTab ||
    input.isPublished ||
    input.publishInFlight ||
    input.isPublishing ||
    input.isSavingAll ||
    input.hasAnyBusySection
  ) {
    return { allowed: false, silent: true };
  }

  if (!input.canPublish) {
    const isCheckingState = !input.isValidationDataReady || input.issueCount === 0;
    return {
      allowed: false,
      silent: false,
      message: isCheckingState
        ? "발행 가능 상태를 확인 중입니다. 잠시 후 다시 시도해주세요."
        : (input.blockingMessage ?? "발행 가능한 상태인지 확인할 수 없습니다."),
    };
  }

  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Outcome Functions
// ---------------------------------------------------------------------------

export function resolveNoChangesOutcome(input: DraftClearOutcomeInput): NoChangesOutcome {
  if (!input.serverDraftCleared || !input.localDraftCleared) {
    return { type: "clear_failed" };
  }

  return { type: "cleared" };
}

export function shouldClearDraftAfterSave(summary: SectionSaveSummary): boolean {
  return (
    summary.savedCount > 0 &&
    summary.failedCount === 0 &&
    summary.invalidCount === 0 &&
    summary.skippedCount === 0
  );
}

export function resolvePostSectionSaveOutcome(input: PostSectionSaveInput): PostSectionSaveOutcome {
  const { mode, summary, showSavedToast, showNoChangesToast } = input;
  const canClearDraft = shouldClearDraftAfterSave(summary);

  if (mode === "publish" && (summary.invalidCount > 0 || summary.failedCount > 0)) {
    return {
      type: "publish_error",
      message: summary.firstErrorMessage ?? "저장에 실패했습니다.",
      result: "failed",
    };
  }

  if (mode === "manual") {
    const skippedCount = summary.skippedCount + summary.invalidCount;
    const processedCount = summary.savedCount + skippedCount + summary.failedCount;

    if (processedCount > 0) {
      const message = buildManualSaveToastMessage({
        savedCount: summary.savedCount,
        skippedCount,
        failedCount: summary.failedCount,
      });

      if (summary.failedCount > 0) {
        return {
          type: "manual_with_failures",
          message,
          result: "failed",
        };
      }

      return {
        type: "manual_processed",
        message,
        shouldClearDraft: summary.savedCount > 0 && canClearDraft,
        showToast: showSavedToast,
        result: summary.savedCount > 0 ? "saved" : "no_changes",
      };
    }
  }

  if (summary.savedCount > 0) {
    return {
      type: "saved",
      shouldClearDraft: canClearDraft,
      showToast: showSavedToast,
      result: "saved",
    };
  }

  return {
    type: "no_changes",
    showToast: showNoChangesToast,
    result: "no_changes",
  };
}

// ---------------------------------------------------------------------------
// Toast Message Builder
// ---------------------------------------------------------------------------

export function buildManualSaveToastMessage(params: {
  savedCount: number;
  skippedCount: number;
  failedCount: number;
}): string {
  const { savedCount, skippedCount, failedCount } = params;
  const lines = [`저장 ${savedCount} / 스킵 ${skippedCount}`];
  if (failedCount > 0) {
    lines.push(`실패 ${failedCount}`);
  }

  return lines.join("\n");
}
