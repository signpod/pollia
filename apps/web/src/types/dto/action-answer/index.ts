import { ActionAnswer } from "@prisma/client";
import { ActionType } from "@prisma/client";

export type { ActionAnswer };

export type ActionAnswerItem =
  | {
      actionId: string;
      type: typeof ActionType.SCALE;
      scaleValue: number;
    }
  | {
      actionId: string;
      type: typeof ActionType.SUBJECTIVE;
      textResponse: string;
    }
  | {
      actionId: string;
      type: typeof ActionType.MULTIPLE_CHOICE;
      selectedOptionIds: string[];
    };

export interface CreateActionAnswerRequest {
  responseId: string;
  actionId: string;
  optionId?: string;
  textAnswer?: string;
  scaleAnswer?: number;
}

export interface SubmitActionAnswersRequest {
  responseId: string;
  answers: Array<{
    actionId: string;
    type: ActionType;
    selectedOptionIds?: string[];
    scaleValue?: number;
    textResponse?: string;
  }>;
}

export interface UpdateActionAnswerRequest {
  optionId?: string;
  textAnswer?: string;
  scaleAnswer?: number;
}

export interface CreateActionAnswerResponse {
  data: {
    id: string;
    responseId: string;
    actionId: string;
    optionId: string | null;
    textAnswer: string | null;
    scaleAnswer: number | null;
    createdAt: Date;
  };
}

export interface SubmitActionAnswersResponse {
  data: {
    responseId: string;
    answersCount: number;
    submittedAt: Date;
  };
}

export interface GetQuestionAnswerResponse {
  data: {
    id: string;
    responseId: string;
    actionId: string;
    optionId: string | null;
    textAnswer: string | null;
    scaleAnswer: number | null;
    createdAt: Date;
  };
}

export interface GetAnswersByResponseResponse {
  data: Array<{
    id: string;
    responseId: string;
    actionId: string;
    optionId: string | null;
    textAnswer: string | null;
    scaleAnswer: number | null;
    createdAt: Date;
  }>;
}

export interface GetAnswersByUserResponse {
  data: Array<{
    id: string;
    responseId: string;
    actionId: string;
    optionId: string | null;
    textAnswer: string | null;
    scaleAnswer: number | null;
    createdAt: Date;
  }>;
}
