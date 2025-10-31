import { atom } from "jotai";
import { SURVEY_TYPES } from "@/constants/survey";
import { SurveyType } from "@/types/domain/survey";

export const surveyTypeAtom = atom<SurveyType | undefined>(undefined);

export const availableSurveyTypesAtom = atom(SURVEY_TYPES);

export const surveyTypeSelectedAtom = atom(get => {
  const surveyType = get(surveyTypeAtom);
  return !!surveyType;
});

export const isEitherOrTypeAtom = atom(get => {
  const surveyType = get(surveyTypeAtom);
  return surveyType === SurveyType.EITHER_OR;
});

export const isMultipleChoiceTypeAtom = atom(get => {
  const surveyType = get(surveyTypeAtom);
  return surveyType === SurveyType.MULTIPLE_CHOICE;
});

export const isScaleTypeAtom = atom(get => {
  const surveyType = get(surveyTypeAtom);
  return surveyType === SurveyType.SCALE;
});

export const isSubjectiveTypeAtom = atom(get => {
  const surveyType = get(surveyTypeAtom);
  return surveyType === SurveyType.SUBJECTIVE;
});

export const categoryStepValidationAtom = atom(get => {
  const surveyType = get(surveyTypeAtom);

  return {
    isValid: !!surveyType,
    errors: {
      surveyType: !surveyType ? "폴 유형을 선택해주세요" : null,
    },
  };
});

export const resetSurveyTypeAtom = atom(null, (_get, set) => {
  set(surveyTypeAtom, undefined);
});

export const setSurveyTypeAtom = atom(null, (_get, set, newSurveyType: SurveyType) => {
  set(surveyTypeAtom, newSurveyType);
});
