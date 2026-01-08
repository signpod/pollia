import type { ActionType } from "@prisma/client";

export interface SubmitAnswersInput {
  responseId: string;
  answers: Array<{
    actionId: string;
    type: ActionType;
    isRequired: boolean;
    selectedOptionIds?: string[];
    scaleValue?: number;
    textAnswer?: string;
    fileUploadIds?: string[];
    dateAnswers?: Date[];
  }>;
}

export interface UpdateAnswerInput {
  selectedOptionIds?: string[];
  textAnswer?: string;
  scaleAnswer?: number;
  dateAnswers?: Date[];
}
