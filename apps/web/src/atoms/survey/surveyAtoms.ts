import { baseInfoSchema } from "@/schemas/survey/baseInfoSchema";
import { SurveyQuestionSummary } from "@/types/domain/survey";
import { SurveyQuestionType } from "@prisma/client";
import { atom } from "jotai";

const DEFAULT_DEADLINE_TIME = "10:30";

export const surveyTitleAtom = atom<string>("");

export const surveyDeadlineDateAtom = atom<Date | undefined>(undefined);
export const surveyDeadlineTimeAtom = atom<string>(DEFAULT_DEADLINE_TIME);

export const surveyEstimatedMinutesAtom = atom<number | undefined>(undefined);

export const surveyDescriptionAtom = atom<string>("");

export const surveyTargetAtom = atom<string>("");

export const selectedQuestionAtom = atom<Set<SurveyQuestionSummary>>(
  new Set<SurveyQuestionSummary>(),
);

export const searchQueryAtom = atom<string>("");

export const selectedQuestionTypesAtom = atom<Set<SurveyQuestionType>>(
  new Set<SurveyQuestionType>(),
);

export const selectedQuestionCountAtom = atom(get => {
  const selectedQuestions = get(selectedQuestionAtom);
  return selectedQuestions.size;
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
  set(surveyDescriptionAtom, "");
  set(surveyTargetAtom, "");
  set(selectedQuestionAtom, new Set<SurveyQuestionSummary>());
  set(searchQueryAtom, "");
  set(surveyDeadlineDateAtom, undefined);
  set(surveyDeadlineTimeAtom, DEFAULT_DEADLINE_TIME);
  set(surveyEstimatedMinutesAtom, undefined);
});

export const surveyValidationAtom = atom(get => {
  const title = get(surveyTitleAtom);
  const selectedQuestions = get(selectedQuestionAtom);

  let titleError: string | null = null;
  const trimmedTitle = title.trim();

  try {
    const result = baseInfoSchema.safeParse({ title: trimmedTitle });
    if (!result.success) {
      const titleIssue = result.error.issues.find(issue => issue.path[0] === "title");
      titleError = titleIssue?.message ?? null;
    }
  } catch {
    titleError = null;
  }

  const questionsError = selectedQuestions.size === 0 ? SURVEY_FORM_ERROR_MESSAGES.questions : null;

  return {
    isValid: !titleError && selectedQuestions.size > 0,
    errors: {
      title: titleError,
      questions: questionsError,
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
  questions: "최소 1개 이상의 질문을 선택해주세요",
};
