import type { SurveyQuestionType } from "@prisma/client";

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
    type: SurveyQuestionType;
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
