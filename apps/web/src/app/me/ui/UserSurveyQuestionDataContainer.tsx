"use client";

import { useReadSurveyQuestions } from "@/hooks/survey/question/useReadSurveyQuestions";
import { ReactNode } from "react";
import { SurveyQuestionSummary } from "@/types/domain/survey";

interface UserSurveyQuestionDataContainerProps {
  children: (data: {
    data: SurveyQuestionSummary[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
  }) => ReactNode;
}

export function UserSurveyQuestionDataContainer({
  children,
}: UserSurveyQuestionDataContainerProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useUserSurveyQuestionData();

  return (
    <>
      {children({
        data: data ?? [],
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
      })}
    </>
  );
}

function useUserSurveyQuestionData() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useReadSurveyQuestions();

  return {
    data: data ?? [],
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
  };
}
