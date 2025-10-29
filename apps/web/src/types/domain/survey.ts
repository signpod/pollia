import { SurveyQuestion } from '@prisma/client';

export enum SurveyType {
  EITHER_OR = 'EITHER_OR',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SCALE = 'SCALE',
  SUBJECTIVE = 'SUBJECTIVE',
}

export type SurveyQuestionSummary = Pick<
  SurveyQuestion,
  'id' | 'title' | 'type' | 'createdAt'
>;
