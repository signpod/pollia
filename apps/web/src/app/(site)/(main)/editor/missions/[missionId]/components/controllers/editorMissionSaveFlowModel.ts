import {
  type EditorSectionKey,
  SECTION_LABELS,
  type SectionSaveSummary,
} from "./editorMissionSaveSummaryModel";

// ---------------------------------------------------------------------------
// Guard Inputs
// ---------------------------------------------------------------------------

export interface UnifiedSaveGuardInput {
  isEditorTab: boolean;
  saveInFlight: boolean;
  isSavingAll: boolean;
  hasAnyBusySection: boolean;
}

// ---------------------------------------------------------------------------
// Guard Results (discriminated unions)
// ---------------------------------------------------------------------------

export type UnifiedSaveGuardResult = { allowed: true } | { allowed: false };

// ---------------------------------------------------------------------------
// Outcome Inputs
// ---------------------------------------------------------------------------

export interface PostSectionSaveInput {
  mode: "manual" | "publish";
  summary: SectionSaveSummary;
  showSavedToast: boolean;
  showNoChangesToast: boolean;
}

// ---------------------------------------------------------------------------
// Outcome Results (discriminated unions)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Outcome Functions
// ---------------------------------------------------------------------------

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
        failedCount: summary.failedCount,
        failedSections: summary.failedSections,
        invalidSections: summary.invalidSections,
        firstErrorMessage: summary.firstErrorMessage,
      });

      if (summary.failedCount > 0 || summary.invalidCount > 0) {
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

function formatSectionNames(sections: EditorSectionKey[]): string {
  return sections.map(key => SECTION_LABELS[key]).join(", ");
}

export function buildManualSaveToastMessage(params: {
  savedCount: number;
  failedCount: number;
  failedSections: EditorSectionKey[];
  invalidSections: EditorSectionKey[];
  firstErrorMessage: string | null;
}): string {
  const { savedCount, failedCount, failedSections, invalidSections, firstErrorMessage } = params;

  if (invalidSections.length > 0) {
    return firstErrorMessage ?? `${formatSectionNames(invalidSections)} 입력값을 확인해주세요.`;
  }

  if (failedCount > 0) {
    const lines: string[] = [];
    if (savedCount > 0) {
      const successSections = (Object.keys(SECTION_LABELS) as EditorSectionKey[]).filter(
        key => !failedSections.includes(key) && !invalidSections.includes(key),
      );
      if (successSections.length > 0) {
        lines.push(`${formatSectionNames(successSections)} 저장 완료`);
      }
    }
    lines.push(`${formatSectionNames(failedSections)} 저장 실패`);
    return lines.join("\n");
  }

  return "변경사항이 저장되었습니다.";
}
