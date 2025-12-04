import { ACTION_TYPES } from "@/constants/action";
import { ActionType } from "@/types/domain/action";
import { atom } from "jotai";

export const actionTypeAtom = atom<ActionType | null>(null);

export const availableActionTypesAtom = atom(ACTION_TYPES);

export const surveyQuestionTypeSelectedAtom = atom(get => {
  const actionType = get(actionTypeAtom);
  return !!actionType;
});

export const isMultipleChoiceTypeAtom = atom(get => {
  const actionType = get(actionTypeAtom);
  return actionType === ActionType.MULTIPLE_CHOICE;
});

export const isScaleTypeAtom = atom(get => {
  const actionType = get(actionTypeAtom);
  return actionType === ActionType.SCALE;
});

export const isSubjectiveTypeAtom = atom(get => {
  const actionType = get(actionTypeAtom);
  return actionType === ActionType.SUBJECTIVE;
});

export const categoryStepValidationAtom = atom(get => {
  const actionType = get(actionTypeAtom);

  return {
    isValid: !!actionType,
    errors: {
      actionType: !actionType ? "질문 유형을 선택해주세요" : null,
    },
  };
});

export const resetActionTypeAtom = atom(null, (_get, set) => {
  set(actionTypeAtom, null);
});

export const setActionTypeAtom = atom(null, (_get, set, newActionType: ActionType) => {
  set(actionTypeAtom, newActionType);
});
