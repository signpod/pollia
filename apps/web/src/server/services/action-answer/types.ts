import type { ActionType } from "@prisma/client";

// 외부 API에서는 스키마를 따라 questionId를 받음
export interface CreateAnswerInput {
  responseId: string;
  questionId: string;
  optionId?: string;
  textAnswer?: string;
  scaleAnswer?: number;
}

export interface SubmitAnswersInput {
  responseId: string;
  answers: Array<{
    questionId: string;
    type: ActionType;
    selectedOptionIds?: string[];
    scaleValue?: number;
    textResponse?: string;
  }>;
}

export interface UpdateAnswerInput {
  optionId?: string;
  textAnswer?: string;
  scaleAnswer?: number;
}
