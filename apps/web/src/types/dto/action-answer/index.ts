import { ActionOption, ActionAnswer as PrismaActionAnswer } from "@prisma/client";
import { ActionType } from "@prisma/client";

export type ActionAnswer = PrismaActionAnswer & {
  options: ActionOption[];
};

export type { PrismaActionAnswer };

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
      type: typeof ActionType.SHORT_TEXT;
      isRequired: boolean;
      textAnswer: string;
    }
  | {
      actionId: string;
      type: typeof ActionType.MULTIPLE_CHOICE;
      isRequired: boolean;
      selectedOptionIds?: string[];
      textAnswer?: string;
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
      type: typeof ActionType.VIDEO;
      isRequired: boolean;
      fileUploadIds: string[];
    }
  | {
      actionId: string;
      type: typeof ActionType.PDF;
      isRequired: boolean;
      fileUploadIds: string[];
    }
  | {
      actionId: string;
      type: typeof ActionType.TAG;
      isRequired: boolean;
      selectedOptionIds?: string[];
      textAnswer?: string;
    }
  | {
      actionId: string;
      type: typeof ActionType.PRIVACY_CONSENT;
      isRequired: boolean;
      booleanAnswer: boolean;
    }
  | {
      actionId: string;
      type: typeof ActionType.DATE;
      isRequired: boolean;
      dateAnswers?: string[];
    }
  | {
      actionId: string;
      type: typeof ActionType.TIME;
      isRequired: boolean;
      dateAnswers?: string[];
    };

export interface CreateActionAnswerRequest {
  responseId: string;
  actionId: string;
  selectedOptionIds?: string[];
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
    dateAnswers?: string[];
  }>;
}

export interface UpdateActionAnswerRequest {
  selectedOptionIds?: string[];
  textAnswer?: string;
  scaleAnswer?: number;
}

export interface CreateActionAnswerResponse {
  data: {
    id: string;
    responseId: string;
    actionId: string;
    options: ActionOption[];
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
    options: ActionOption[];
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
    options: ActionOption[];
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
    options: ActionOption[];
    textAnswer: string | null;
    scaleAnswer: number | null;
    createdAt: Date;
  }>;
}
