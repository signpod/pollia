import type { SectionSaveResult } from "../editor-save.types";

export type EditorSectionKey = "basic" | "reward" | "action" | "completion";

export interface SectionSaveSummary {
  savedCount: number;
  skippedCount: number;
  failedCount: number;
  invalidCount: number;
  failedSections: EditorSectionKey[];
  invalidSections: EditorSectionKey[];
  firstErrorMessage: string | null;
}

export interface SaveSectionDescriptor {
  key: EditorSectionKey;
  label: string;
}

export function createEmptySectionSaveSummary(): SectionSaveSummary {
  return {
    savedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    invalidCount: 0,
    failedSections: [],
    invalidSections: [],
    firstErrorMessage: null,
  };
}

export function accumulateSectionSaveResult(
  summary: SectionSaveSummary,
  section: SaveSectionDescriptor,
  result: SectionSaveResult,
): SectionSaveSummary {
  const nextSummary: SectionSaveSummary = {
    ...summary,
    savedCount:
      summary.savedCount +
      (result.status === "saved" ? (result.savedCount ?? 1) : (result.savedCount ?? 0)),
    skippedCount: summary.skippedCount + (result.skippedCount ?? 0),
    failedCount: summary.failedCount + (result.failedCount ?? (result.status === "failed" ? 1 : 0)),
    invalidCount:
      summary.invalidCount + (result.invalidCount ?? (result.status === "invalid" ? 1 : 0)),
  };

  if (
    result.status === "invalid" ||
    result.invalidCount !== undefined ||
    (result.invalidCount ?? 0) > 0
  ) {
    nextSummary.invalidSections = [...summary.invalidSections, section.key];
    nextSummary.firstErrorMessage ??= result.message ?? `${section.label} 입력값을 확인해주세요.`;
  }

  if (
    result.status === "failed" ||
    result.failedCount !== undefined ||
    (result.failedCount ?? 0) > 0
  ) {
    nextSummary.failedSections = [...summary.failedSections, section.key];
    nextSummary.firstErrorMessage ??= result.message ?? `${section.label} 저장에 실패했습니다.`;
  }

  return nextSummary;
}

export function computeManualSaveDisplayCounts(summary: SectionSaveSummary): {
  skippedCount: number;
  processedCount: number;
} {
  const skippedCount = summary.skippedCount + summary.invalidCount;
  return {
    skippedCount,
    processedCount: summary.savedCount + skippedCount + summary.failedCount,
  };
}
