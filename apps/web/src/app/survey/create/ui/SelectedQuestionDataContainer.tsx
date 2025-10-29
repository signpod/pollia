'use client';

import { useAtomValue } from 'jotai';
import { selectedQuestionAtom } from '@/atoms/create/surveyAtoms';
import { ReactNode, useMemo } from 'react';
import { SurveyQuestionSummary } from '@/types/domain/survey';

interface SelectedQuestionDataContainerProps {
  children: (data: { questions: SurveyQuestionSummary[] }) => ReactNode;
}

export function SelectedQuestionDataContainer({
  children,
}: SelectedQuestionDataContainerProps) {
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
