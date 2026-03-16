import {
  buildManualSaveToastMessage,
  checkUnifiedSaveGuard,
  resolveNoChangesOutcome,
  resolvePostSectionSaveOutcome,
  shouldClearDraftAfterSave,
} from "../editorMissionSaveFlowModel";
import { createEmptySectionSaveSummary } from "../editorMissionSaveSummaryModel";

describe("checkUnifiedSaveGuard", () => {
  const baseInput = {
    isEditorTab: true,
    saveInFlight: false,
    isSavingAll: false,
    hasAnyBusySection: false,
  };

  it("모든 조건이 충족되면 allowed: true를 반환한다", () => {
    expect(checkUnifiedSaveGuard(baseInput)).toEqual({ allowed: true });
  });

  it("에디터 탭이 아니면 allowed: false를 반환한다", () => {
    expect(checkUnifiedSaveGuard({ ...baseInput, isEditorTab: false })).toEqual({
      allowed: false,
    });
  });

  it("저장이 진행 중이면 allowed: false를 반환한다", () => {
    expect(checkUnifiedSaveGuard({ ...baseInput, saveInFlight: true })).toEqual({
      allowed: false,
    });
  });

  it("전체 저장 중이면 allowed: false를 반환한다", () => {
    expect(checkUnifiedSaveGuard({ ...baseInput, isSavingAll: true })).toEqual({
      allowed: false,
    });
  });

  it("바쁜 섹션이 있으면 allowed: false를 반환한다", () => {
    expect(checkUnifiedSaveGuard({ ...baseInput, hasAnyBusySection: true })).toEqual({
      allowed: false,
    });
  });
});

describe("resolveNoChangesOutcome", () => {
  it("서버 정리 성공하면 cleared를 반환한다", () => {
    expect(
      resolveNoChangesOutcome({
        serverDraftCleared: true,
      }),
    ).toEqual({ type: "cleared" });
  });

  it("서버 정리 실패 시 clear_failed를 반환한다", () => {
    expect(
      resolveNoChangesOutcome({
        serverDraftCleared: false,
      }),
    ).toEqual({ type: "clear_failed" });
  });
});

describe("shouldClearDraftAfterSave", () => {
  it("모두 성공이면 true를 반환한다", () => {
    expect(
      shouldClearDraftAfterSave({
        ...createEmptySectionSaveSummary(),
        savedCount: 3,
      }),
    ).toBe(true);
  });

  it("savedCount가 0이면 false를 반환한다", () => {
    expect(shouldClearDraftAfterSave(createEmptySectionSaveSummary())).toBe(false);
  });

  it("failedCount가 있으면 false를 반환한다", () => {
    expect(
      shouldClearDraftAfterSave({
        ...createEmptySectionSaveSummary(),
        savedCount: 2,
        failedCount: 1,
      }),
    ).toBe(false);
  });

  it("invalidCount가 있으면 false를 반환한다", () => {
    expect(
      shouldClearDraftAfterSave({
        ...createEmptySectionSaveSummary(),
        savedCount: 2,
        invalidCount: 1,
      }),
    ).toBe(false);
  });

  it("skippedCount가 있으면 false를 반환한다", () => {
    expect(
      shouldClearDraftAfterSave({
        ...createEmptySectionSaveSummary(),
        savedCount: 2,
        skippedCount: 1,
      }),
    ).toBe(false);
  });
});

describe("resolvePostSectionSaveOutcome", () => {
  // Given: publish 모드에서 에러가 있는 경우
  describe("publish 모드", () => {
    it("invalidCount가 있으면 publish_error를 반환한다", () => {
      const result = resolvePostSectionSaveOutcome({
        mode: "publish",
        summary: {
          ...createEmptySectionSaveSummary(),
          invalidCount: 1,
          firstErrorMessage: "입력값 오류",
        },
        showSavedToast: true,
        showNoChangesToast: true,
      });

      expect(result.type).toBe("publish_error");
      expect(result.result).toBe("failed");
      if (result.type === "publish_error") {
        expect(result.message).toBe("입력값 오류");
      }
    });

    it("failedCount가 있으면 publish_error를 반환한다", () => {
      const result = resolvePostSectionSaveOutcome({
        mode: "publish",
        summary: {
          ...createEmptySectionSaveSummary(),
          failedCount: 1,
        },
        showSavedToast: true,
        showNoChangesToast: true,
      });

      expect(result.type).toBe("publish_error");
      expect(result.result).toBe("failed");
    });

    it("firstErrorMessage가 없으면 기본 메시지를 사용한다", () => {
      const result = resolvePostSectionSaveOutcome({
        mode: "publish",
        summary: {
          ...createEmptySectionSaveSummary(),
          failedCount: 1,
          firstErrorMessage: null,
        },
        showSavedToast: true,
        showNoChangesToast: true,
      });

      if (result.type === "publish_error") {
        expect(result.message).toBe("저장에 실패했습니다.");
      }
    });

    it("성공 시 saved를 반환한다", () => {
      const result = resolvePostSectionSaveOutcome({
        mode: "publish",
        summary: {
          ...createEmptySectionSaveSummary(),
          savedCount: 2,
        },
        showSavedToast: true,
        showNoChangesToast: true,
      });

      expect(result.type).toBe("saved");
      expect(result.result).toBe("saved");
    });
  });

  // Given: manual 모드
  describe("manual 모드", () => {
    it("failedCount가 있으면 manual_with_failures를 반환한다", () => {
      const result = resolvePostSectionSaveOutcome({
        mode: "manual",
        summary: {
          ...createEmptySectionSaveSummary(),
          savedCount: 1,
          failedCount: 1,
          failedSections: ["action"],
        },
        showSavedToast: true,
        showNoChangesToast: true,
      });

      expect(result.type).toBe("manual_with_failures");
      expect(result.result).toBe("failed");
    });

    it("invalidCount가 있으면 manual_with_failures를 반환한다", () => {
      const result = resolvePostSectionSaveOutcome({
        mode: "manual",
        summary: {
          ...createEmptySectionSaveSummary(),
          savedCount: 1,
          invalidCount: 1,
          invalidSections: ["reward"],
          firstErrorMessage: "리워드 입력값을 확인해주세요.",
        },
        showSavedToast: true,
        showNoChangesToast: true,
      });

      expect(result.type).toBe("manual_with_failures");
      expect(result.result).toBe("failed");
      if (result.type === "manual_with_failures") {
        expect(result.message).toBe("리워드 입력값을 확인해주세요.");
      }
    });

    it("savedCount > 0이면 manual_processed로 saved 결과를 반환한다", () => {
      const result = resolvePostSectionSaveOutcome({
        mode: "manual",
        summary: {
          ...createEmptySectionSaveSummary(),
          savedCount: 2,
        },
        showSavedToast: true,
        showNoChangesToast: true,
      });

      expect(result.type).toBe("manual_processed");
      expect(result.result).toBe("saved");
      if (result.type === "manual_processed") {
        expect(result.shouldClearDraft).toBe(true);
      }
    });

    it("savedCount가 0이고 skippedCount만 있으면 no_changes 결과를 반환한다", () => {
      const result = resolvePostSectionSaveOutcome({
        mode: "manual",
        summary: {
          ...createEmptySectionSaveSummary(),
          skippedCount: 1,
        },
        showSavedToast: true,
        showNoChangesToast: true,
      });

      expect(result.type).toBe("manual_processed");
      expect(result.result).toBe("no_changes");
    });

    it("processedCount가 0이면 no_changes를 반환한다", () => {
      const result = resolvePostSectionSaveOutcome({
        mode: "manual",
        summary: createEmptySectionSaveSummary(),
        showSavedToast: true,
        showNoChangesToast: true,
      });

      expect(result.type).toBe("no_changes");
      expect(result.result).toBe("no_changes");
    });

    it("showSavedToast가 false면 showToast도 false다", () => {
      const result = resolvePostSectionSaveOutcome({
        mode: "manual",
        summary: {
          ...createEmptySectionSaveSummary(),
          savedCount: 2,
        },
        showSavedToast: false,
        showNoChangesToast: true,
      });

      if (result.type === "manual_processed") {
        expect(result.showToast).toBe(false);
      }
    });

    it("showNoChangesToast가 false면 no_changes의 showToast도 false다", () => {
      const result = resolvePostSectionSaveOutcome({
        mode: "manual",
        summary: createEmptySectionSaveSummary(),
        showSavedToast: true,
        showNoChangesToast: false,
      });

      if (result.type === "no_changes") {
        expect(result.showToast).toBe(false);
      }
    });

    it("saved와 skipped가 섞여 있으면 shouldClearDraft가 false다", () => {
      const result = resolvePostSectionSaveOutcome({
        mode: "manual",
        summary: {
          ...createEmptySectionSaveSummary(),
          savedCount: 1,
          skippedCount: 1,
        },
        showSavedToast: true,
        showNoChangesToast: true,
      });

      if (result.type === "manual_processed") {
        expect(result.shouldClearDraft).toBe(false);
      }
    });
  });
});

describe("buildManualSaveToastMessage", () => {
  const baseParams = {
    savedCount: 0,
    failedCount: 0,
    failedSections: [] as ("basic" | "reward" | "action" | "completion")[],
    invalidSections: [] as ("basic" | "reward" | "action" | "completion")[],
    firstErrorMessage: null as string | null,
  };

  it("모두 성공이면 저장 완료 메시지를 반환한다", () => {
    expect(buildManualSaveToastMessage({ ...baseParams, savedCount: 2 })).toBe(
      "변경사항이 저장되었습니다.",
    );
  });

  it("실패 섹션이 있으면 성공/실패 섹션명을 포함한다", () => {
    const message = buildManualSaveToastMessage({
      ...baseParams,
      savedCount: 1,
      failedCount: 1,
      failedSections: ["action"],
    });
    expect(message).toContain("액션 저장 실패");
  });

  it("부분 실패 시 성공 섹션명도 포함한다", () => {
    const message = buildManualSaveToastMessage({
      ...baseParams,
      savedCount: 2,
      failedCount: 1,
      failedSections: ["action"],
    });
    expect(message).toContain("저장 완료");
    expect(message).toContain("액션 저장 실패");
  });

  it("검증 오류가 있으면 firstErrorMessage를 반환한다", () => {
    const message = buildManualSaveToastMessage({
      ...baseParams,
      invalidSections: ["reward"],
      firstErrorMessage: "리워드 입력값을 확인해주세요.",
    });
    expect(message).toBe("리워드 입력값을 확인해주세요.");
  });

  it("검증 오류 시 firstErrorMessage가 없으면 기본 메시지를 생성한다", () => {
    const message = buildManualSaveToastMessage({
      ...baseParams,
      invalidSections: ["basic", "reward"],
      firstErrorMessage: null,
    });
    expect(message).toBe("기본 정보, 리워드 입력값을 확인해주세요.");
  });
});
