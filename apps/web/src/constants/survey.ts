import { SurveyType } from "@/types/domain/survey";

export const SURVEY_TYPES: SurveyType[] = [
  SurveyType.EITHER_OR,
  SurveyType.MULTIPLE_CHOICE,
  SurveyType.SCALE,
  SurveyType.SUBJECTIVE,
];

export const TYPE_LABELS = {
  [SurveyType.EITHER_OR]: "O, X",
  [SurveyType.MULTIPLE_CHOICE]: "여러 선택지",
  [SurveyType.SCALE]: "척도형",
  [SurveyType.SUBJECTIVE]: "주관식",
};
