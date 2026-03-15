import {
  buildManualSaveToastMessage,
  checkSaveGuard,
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

describe("checkSaveGuard", () => {
  it("검증 데이터가 준비되고 이슈가 없으면 allowed: true를 반환한다", () => {
    expect(
      checkSaveGuard({
        isValidationDataReady: true,
        issueCount: 0,
        blockingMessage: null,
      }),
    ).toEqual({ allowed: true });
  });

  it("검증 데이터가 준비되지 않으면 확인 중 메시지를 반환한다", () => {
    const result = checkSaveGuard({
      isValidationDataReady: false,
      issueCount: 0,
      blockingMessage: null,
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.message).toContain("확인 중");
    }
  });

  it("이슈가 있으면 blockingMessage를 반환한다", () => {
    const result = checkSaveGuard({
      isValidationDataReady: true,
      issueCount: 2,
      blockingMessage: "플로우 오류",
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.message).toBe("플로우 오류");
    }
  });

  it("이슈가 있지만 blockingMessage가 없으면 기본 메시지를 반환한다", () => {
    const result = checkSaveGuard({
      isValidationDataReady: true,
      issueCount: 1,
      blockingMessage: null,
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.message).toContain("확인할 수 없습니다");
    }
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
        },
        showSavedToast: true,
        showNoChangesToast: true,
      });

      expect(result.type).toBe("manual_with_failures");
      expect(result.result).toBe("failed");
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
  it("기본 메시지를 생성한다", () => {
    expect(buildManualSaveToastMessage({ savedCount: 2, skippedCount: 1, failedCount: 0 })).toBe(
      "저장 2 / 스킵 1",
    );
  });

  it("실패가 있으면 실패 줄을 추가한다", () => {
    const message = buildManualSaveToastMessage({
      savedCount: 1,
      skippedCount: 0,
      failedCount: 2,
    });
    expect(message).toContain("실패 2");
  });
});
