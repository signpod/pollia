import { SurveyQuestionType } from "@/types/domain/survey";

export const SURVEY_QUESTION_TYPES: SurveyQuestionType[] = [
  SurveyQuestionType.MULTIPLE_CHOICE,
  SurveyQuestionType.SCALE,
  SurveyQuestionType.SUBJECTIVE,
];

export const SURVEY_QUESTION_TYPE_LABELS: Record<SurveyQuestionType, string> = {
  [SurveyQuestionType.MULTIPLE_CHOICE]: "여러 선택지",
  [SurveyQuestionType.SCALE]: "척도형",
  [SurveyQuestionType.SUBJECTIVE]: "주관식",
};
