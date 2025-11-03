"use client";

import { searchQueryAtom, selectedQuestionTypesAtom } from "@/atoms/survey/surveyAtoms";
import { useReadSurveyQuestions } from "@/hooks/survey/question/useReadSurveyQuestions";
import { SurveyQuestionSummary } from "@/types/domain/survey";
import { useAtomValue } from "jotai";
import { ReactNode, useMemo } from "react";
import { getSortedQuestions } from "../util/sortedQuestion";

interface SurveyQuestionDataContainerProps {
  children: (data: { questions: SurveyQuestionSummary[]; isLoading: boolean }) => ReactNode;
}

export function SurveyQuestionDataContainer({ children }: SurveyQuestionDataContainerProps) {
  const { questions, isLoading } = useSurveyQuestionData();

  return <>{children({ questions: questions ?? [], isLoading })}</>;
}

function useSurveyQuestionData() {
  const selectedQuestionTypes = useAtomValue(selectedQuestionTypesAtom);
  const searchQuery = useAtomValue(searchQueryAtom);

  const { data: questions, isLoading } = useReadSurveyQuestions({
    options: {
      searchQuery,
      selectedQuestionTypes: Array.from(selectedQuestionTypes),
      isDraft: true,
    },
  });

  const sortedQuestions = useMemo(() => {
    if (!questions) return [];

    return getSortedQuestions([...questions]);
  }, [questions]);

  return {
    questions: sortedQuestions,
    isLoading,
  };
}
