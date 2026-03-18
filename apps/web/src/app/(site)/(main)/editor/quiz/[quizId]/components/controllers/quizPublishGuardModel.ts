import type { PublishGuardResult } from "../../../../atoms/editorPublishGuardAtom";

export interface QuizPublishGuardInput {
  serverActionsCount: number;
  serverCompletionsCount: number;
  questionDraftCount: number;
  completionDraftCount: number;
}

export function checkQuizPublishGuard(params: QuizPublishGuardInput): PublishGuardResult {
  const totalQuestions = params.serverActionsCount + params.questionDraftCount;
  const totalCompletions = params.serverCompletionsCount + params.completionDraftCount;

  if (totalQuestions < 1 && totalCompletions < 1) {
    return { allowed: false, message: "질문과 결과화면을 1개 이상 추가해주세요." };
  }
  if (totalQuestions < 1) {
    return { allowed: false, message: "질문을 1개 이상 추가해주세요." };
  }
  if (totalCompletions < 1) {
    return { allowed: false, message: "결과화면을 1개 이상 추가해주세요." };
  }
  return { allowed: true };
}
