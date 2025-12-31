import { ActionAnswer } from "@prisma/client";
import { ActionType } from "@prisma/client";

export type { ActionAnswer };

export type ActionAnswerItem =
  | {
      actionId: string;
      type: typeof ActionType.SCALE;
      isRequired: boolean;
      scaleValue: number;
    }
  | {
      actionId: string;
      type: typeof ActionType.SUBJECTIVE;
      isRequired: boolean;
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
      isRequired: boolean;
      selectedOptionIds: string[];
    }
  | {
      actionId: string;
      type: typeof ActionType.RATING;
      isRequired: boolean;
      scaleValue: number;
    }
  | {
      actionId: string;
      type: typeof ActionType.IMAGE;
      isRequired: boolean;
      fileUploadIds: string[];
    }
  | {
      actionId: string;
      type: typeof ActionType.TAG;
      isRequired: boolean;
      selectedOptionIds: string[];
    }
  | {
      actionId: string;
      type: typeof ActionType.PRIVACY_CONSENT;
      isRequired: boolean;
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
    isRequired: boolean;
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
