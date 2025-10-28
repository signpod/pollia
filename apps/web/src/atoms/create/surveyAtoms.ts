import { atom } from 'jotai';

export const surveyTitleAtom = atom<string>('');

export const selectedQuestionIdsAtom = atom<string[]>([]);

export const searchQueryAtom = atom<string>('');

export const surveyTitleTouchedAtom = atom<boolean>(false);

export const selectedQuestionCountAtom = atom((get) => {
  const selectedIds = get(selectedQuestionIdsAtom);
  return selectedIds.length;
});

export const toggleQuestionAtom = atom(null, (get, set, questionId: string) => {
  const currentIds = get(selectedQuestionIdsAtom);
  if (currentIds.includes(questionId)) {
    set(
      selectedQuestionIdsAtom,
      currentIds.filter((id) => id !== questionId)
    );
  } else {
    set(selectedQuestionIdsAtom, [...currentIds, questionId]);
  }
});

export const selectAllQuestionsAtom = atom(
  null,
  (_get, set, questionIds: string[]) => {
    set(selectedQuestionIdsAtom, questionIds);
  }
);

export const deselectAllQuestionsAtom = atom(null, (_get, set) => {
  set(selectedQuestionIdsAtom, []);
});

export const reorderQuestionsAtom = atom(
  null,
  (_get, set, newOrder: string[]) => {
    set(selectedQuestionIdsAtom, newOrder);
  }
);

export const resetSurveyAtom = atom(null, (_get, set) => {
  set(surveyTitleAtom, '');
  set(selectedQuestionIdsAtom, []);
  set(searchQueryAtom, '');
});

export const surveyValidationAtom = atom((get) => {
  const title = get(surveyTitleAtom);
  const selectedIds = get(selectedQuestionIdsAtom);

  return {
    isValid: !!title && selectedIds.length > 0,
    errors: {
      title: !title ? SURVEY_FORM_ERROR_MESSAGES.title : null,
      questions:
        selectedIds.length === 0 ? SURVEY_FORM_ERROR_MESSAGES.questions : null,
    },
  };
});

const SURVEY_FORM_ERROR_MESSAGES = {
  title: '설문조사지 제목을 입력해주세요',
  questions: '최소 1개 이상의 질문을 선택해주세요',
};
