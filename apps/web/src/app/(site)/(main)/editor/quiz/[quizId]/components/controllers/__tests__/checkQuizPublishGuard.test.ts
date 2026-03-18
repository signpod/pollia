import { checkQuizPublishGuard } from "../quizPublishGuardModel";

describe("checkQuizPublishGuard", () => {
  it("질문과 결과화면이 모두 없으면 allowed=false, 복합 메시지를 반환한다", () => {
    const result = checkQuizPublishGuard({
      serverActionsCount: 0,
      serverCompletionsCount: 0,
      questionDraftCount: 0,
      completionDraftCount: 0,
    });

    expect(result.allowed).toBe(false);
    expect(result.message).toBe("질문과 결과화면을 1개 이상 추가해주세요.");
  });

  it("질문만 없으면 allowed=false, 질문 메시지를 반환한다", () => {
    const result = checkQuizPublishGuard({
      serverActionsCount: 0,
      serverCompletionsCount: 1,
      questionDraftCount: 0,
      completionDraftCount: 0,
    });

    expect(result.allowed).toBe(false);
    expect(result.message).toBe("질문을 1개 이상 추가해주세요.");
  });

  it("결과화면만 없으면 allowed=false, 결과화면 메시지를 반환한다", () => {
    const result = checkQuizPublishGuard({
      serverActionsCount: 1,
      serverCompletionsCount: 0,
      questionDraftCount: 0,
      completionDraftCount: 0,
    });

    expect(result.allowed).toBe(false);
    expect(result.message).toBe("결과화면을 1개 이상 추가해주세요.");
  });

  it("서버 질문과 서버 결과화면이 각각 1개 이상이면 allowed=true를 반환한다", () => {
    const result = checkQuizPublishGuard({
      serverActionsCount: 2,
      serverCompletionsCount: 1,
      questionDraftCount: 0,
      completionDraftCount: 0,
    });

    expect(result.allowed).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it("드래프트 질문과 드래프트 결과화면도 합산하여 검증한다", () => {
    const result = checkQuizPublishGuard({
      serverActionsCount: 0,
      serverCompletionsCount: 0,
      questionDraftCount: 1,
      completionDraftCount: 2,
    });

    expect(result.allowed).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it("서버와 드래프트를 혼합한 경우에도 정상 동작한다", () => {
    const result = checkQuizPublishGuard({
      serverActionsCount: 1,
      serverCompletionsCount: 0,
      questionDraftCount: 0,
      completionDraftCount: 1,
    });

    expect(result.allowed).toBe(true);
  });
});
