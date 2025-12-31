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
      textAnswer: string;
    }
  | {
      actionId: string;
      type: typeof ActionType.URL;
      textAnswer: string;
    }
  | {
      actionId: string;
      type: typeof ActionType.MULTIPLE_CHOICE;
      selectedOptionIds: string[];
    }
  | {
      actionId: string;
      type: typeof ActionType.RATING;
      scaleValue: number;
    }
  | {
      actionId: string;
      type: typeof ActionType.IMAGE;
      fileUploadIds: string[];
    }
  | {
      actionId: string;
      type: typeof ActionType.TAG;
      selectedOptionIds: string[];
    }
  | {
      actionId: string;
      type: typeof ActionType.PRIVACY_CONSENT;
      booleanAnswer: boolean;
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
    textAnswer?: string;
    fileUploadIds?: string[];
    booleanAnswer?: boolean;
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
