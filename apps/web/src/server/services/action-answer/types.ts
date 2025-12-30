import type { ActionType } from "@prisma/client";

export interface CreateAnswerInput {
  responseId: string;
  actionId: string;
  optionId?: string;
  textAnswer?: string;
  scaleAnswer?: number;
  dateAnswers?: Date[];
}

export interface SubmitAnswersInput {
  responseId: string;
  answers: Array<{
    actionId: string;
    type: ActionType;
    selectedOptionIds?: string[];
    scaleValue?: number;
    textAnswer?: string;
    fileUploadIds?: string[];
    dateAnswers?: Date[];
  }>;
}

export interface UpdateAnswerInput {
  optionId?: string;
  textAnswer?: string;
  scaleAnswer?: number;
  dateAnswers?: Date[];
}
