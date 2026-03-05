import {
  accumulateSectionSaveResult,
  computeManualSaveDisplayCounts,
  createEmptySectionSaveSummary,
} from "../editorMissionSaveSummaryModel";

describe("editorMissionSaveSummaryModel", () => {
  it("invalidCount가 없는 invalid 결과는 invalid만 증가시키고 skipped는 증가시키지 않는다", () => {
    const summary = createEmptySectionSaveSummary();

    const nextSummary = accumulateSectionSaveResult(
      summary,
      { key: "basic", label: "기본 정보" },
      { status: "invalid", message: "입력값을 확인해주세요." },
    );

    expect(nextSummary.invalidCount).toBe(1);
    expect(nextSummary.skippedCount).toBe(0);

    const display = computeManualSaveDisplayCounts(nextSummary);
    expect(display.skippedCount).toBe(1);
    expect(display.processedCount).toBe(1);
  });

  it("invalidCount/skippedCount가 명시된 invalid 결과를 의도대로 누적한다", () => {
    const summary = createEmptySectionSaveSummary();

    const nextSummary = accumulateSectionSaveResult(
      summary,
      { key: "action", label: "액션" },
      {
        status: "invalid",
        invalidCount: 2,
        skippedCount: 1,
      },
    );

    expect(nextSummary.invalidCount).toBe(2);
    expect(nextSummary.skippedCount).toBe(1);

    const display = computeManualSaveDisplayCounts(nextSummary);
    expect(display.skippedCount).toBe(3);
    expect(display.processedCount).toBe(3);
  });

  it("수동 저장 표시 계산은 skipped + invalid를 한 번만 합산한다", () => {
    const display = computeManualSaveDisplayCounts({
      ...createEmptySectionSaveSummary(),
      savedCount: 2,
      skippedCount: 1,
      failedCount: 1,
      invalidCount: 2,
    });

    expect(display.skippedCount).toBe(3);
    expect(display.processedCount).toBe(6);
  });

  it("invalid/failed 섹션을 기록하고 firstErrorMessage 우선순위를 유지한다", () => {
    const withInvalid = accumulateSectionSaveResult(
      createEmptySectionSaveSummary(),
      { key: "basic", label: "기본 정보" },
      { status: "invalid", message: "첫 번째 invalid" },
    );

    const withFailed = accumulateSectionSaveResult(
      withInvalid,
      { key: "reward", label: "리워드" },
      { status: "failed", message: "두 번째 failed" },
    );

    expect(withFailed.invalidSections).toEqual(["basic"]);
    expect(withFailed.failedSections).toEqual(["reward"]);
    expect(withFailed.firstErrorMessage).toBe("첫 번째 invalid");
  });
});
