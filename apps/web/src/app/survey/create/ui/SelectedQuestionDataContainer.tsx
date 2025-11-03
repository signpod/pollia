"use client";

import { selectedQuestionAtom } from "@/atoms/survey/surveyAtoms";
import { SurveyQuestionSummary } from "@/types/domain/survey";
import { useAtomValue } from "jotai";
import { ReactNode, useMemo } from "react";

interface SelectedQuestionDataContainerProps {
  children: (data: { questions: SurveyQuestionSummary[] }) => ReactNode;
}

export function SelectedQuestionDataContainer({ children }: SelectedQuestionDataContainerProps) {
  const { questions } = useSelectedQuestionData();

  return <>{children({ questions: questions ?? [] })}</>;
}

function useSelectedQuestionData() {
  const selectedQuestions = useAtomValue(selectedQuestionAtom);

  const sortedQuestions = useMemo(() => {
    if (!selectedQuestions) return [];

    return [...selectedQuestions];
  }, [selectedQuestions]);

  return {
    questions: sortedQuestions,
  };
}
