'use client';

import { useAtomValue } from 'jotai';
import {
  searchQueryAtom,
  selectedQuestionTypesAtom,
} from '@/atoms/create/surveyAtoms';
import { useReadSurveyQuestions } from '@/hooks/survey/question/useReadSurveyQuestions';
import { ReactNode, useMemo } from 'react';
import { getSortedQuestions } from '../util/sortedQuestion';
import { SurveyQuestionSummary } from '@/types/domain/survey';

interface SurveyQuestionDataContainerProps {
  children: (data: {
    questions: SurveyQuestionSummary[];
    isLoading: boolean;
  }) => ReactNode;
}

export function SurveyQuestionDataContainer({
  children,
}: SurveyQuestionDataContainerProps) {
  const { questions, isLoading } = useSurveyQuestionData();

  return <>{children({ questions: questions ?? [], isLoading })}</>;
}

function useSurveyQuestionData() {
  const selectedQuestionTypes = useAtomValue(selectedQuestionTypesAtom);
  const searchQuery = useAtomValue(searchQueryAtom);

  const { data: questions, isLoading } = useReadSurveyQuestions({
    options: {
      searchQuery: searchQuery ?? '',
      selectedQuestionTypes: Array.from(selectedQuestionTypes),
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
