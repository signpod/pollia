import { SurveyQuestionSummary } from "@/types/domain/survey";
import { SurveyQuestionType } from "@prisma/client";
import { atom } from "jotai";

export const surveyTitleAtom = atom<string>("");

export const selectedQuestionAtom = atom<Set<SurveyQuestionSummary>>(
  new Set<SurveyQuestionSummary>(),
);

export const searchQueryAtom = atom<string>("");

export const surveyTitleTouchedAtom = atom<boolean>(false);

export const selectedQuestionTypesAtom = atom<Set<SurveyQuestionType>>(
  new Set<SurveyQuestionType>(),
);

export const selectedQuestionCountAtom = atom(get => {
  const selectedQuestions = get(selectedQuestionAtom);
  return selectedQuestions.size;
});

export const toggleQuestionAtom = atom(null, (get, set, question: SurveyQuestionSummary) => {
  const currentQuestions = get(selectedQuestionAtom);
  if (currentQuestions.has(question)) {
    set(selectedQuestionAtom, new Set([...currentQuestions].filter(q => q.id !== question.id)));
  } else {
    set(selectedQuestionAtom, new Set([...currentQuestions, question]));
  }
});

export const selectAllQuestionsAtom = atom(
  null,
  (_get, set, questions: SurveyQuestionSummary[]) => {
    set(selectedQuestionAtom, new Set(questions));
  },
);

export const deselectAllQuestionsAtom = atom(null, (_get, set) => {
  set(selectedQuestionAtom, new Set<SurveyQuestionSummary>());
});

export const reorderQuestionsAtom = atom(null, (_get, set, newOrder: SurveyQuestionSummary[]) => {
  set(selectedQuestionAtom, new Set(newOrder));
});

export const resetSurveyAtom = atom(null, (_get, set) => {
  set(surveyTitleAtom, "");
  set(selectedQuestionAtom, new Set<SurveyQuestionSummary>());
  set(searchQueryAtom, "");
  set(surveyTitleTouchedAtom, false);
});

export const surveyValidationAtom = atom(get => {
  const title = get(surveyTitleAtom);
  const selectedQuestions = get(selectedQuestionAtom);

  return {
    isValid: !!title && selectedQuestions.size > 0,
    errors: {
      title: !title ? SURVEY_FORM_ERROR_MESSAGES.title : null,
      questions: selectedQuestions.size === 0 ? SURVEY_FORM_ERROR_MESSAGES.questions : null,
    },
  };
});

export const toggleQuestionTypeAtom = atom(null, (get, set, questionType: SurveyQuestionType) => {
  const currentTypes = get(selectedQuestionTypesAtom);
  if (currentTypes?.has(questionType)) {
    set(
      selectedQuestionTypesAtom,
      new Set([...currentTypes].filter(type => type !== questionType)),
    );
  } else {
    set(selectedQuestionTypesAtom, new Set([...(currentTypes ?? []), questionType]));
  }
});

const SURVEY_FORM_ERROR_MESSAGES = {
  title: "설문조사지 제목을 입력해주세요",
  questions: "최소 1개 이상의 질문을 선택해주세요",
};
