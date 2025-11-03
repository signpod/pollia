import { SURVEY_QUESTION_TYPES } from "@/constants/survey";
import { SurveyQuestionType } from "@/types/domain/survey";
import { atom } from "jotai";

export const surveyQuestionTypeAtom = atom<SurveyQuestionType | undefined>(undefined);

export const availableSurveyTypesAtom = atom(SURVEY_QUESTION_TYPES);

export const surveyQuestionTypeSelectedAtom = atom(get => {
  const surveyQuestionType = get(surveyQuestionTypeAtom);
  return !!surveyQuestionType;
});

export const isMultipleChoiceTypeAtom = atom(get => {
  const surveyQuestionType = get(surveyQuestionTypeAtom);
  return surveyQuestionType === SurveyQuestionType.MULTIPLE_CHOICE;
});

export const isScaleTypeAtom = atom(get => {
  const surveyQuestionType = get(surveyQuestionTypeAtom);
  return surveyQuestionType === SurveyQuestionType.SCALE;
});

export const isSubjectiveTypeAtom = atom(get => {
  const surveyQuestionType = get(surveyQuestionTypeAtom);
  return surveyQuestionType === SurveyQuestionType.SUBJECTIVE;
});

export const categoryStepValidationAtom = atom(get => {
  const surveyQuestionType = get(surveyQuestionTypeAtom);

  return {
    isValid: !!surveyQuestionType,
    errors: {
      surveyQuestionType: !surveyQuestionType ? "질문 유형을 선택해주세요" : null,
    },
  };
});

export const resetSurveyTypeAtom = atom(null, (_get, set) => {
  set(surveyQuestionTypeAtom, undefined);
});

export const setSurveyTypeAtom = atom(null, (_get, set, newSurveyType: SurveyQuestionType) => {
  set(surveyQuestionTypeAtom, newSurveyType);
});
