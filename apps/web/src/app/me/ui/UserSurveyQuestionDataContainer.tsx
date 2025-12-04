"use client";

import { useReadActions } from "@/hooks/action/useReadActions";
import { ActionSummary } from "@/types/domain/action";
import { ReactNode } from "react";

interface UserSurveyQuestionDataContainerProps {
  children: (data: {
    data: ActionSummary[];
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
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useReadActions();

  return {
    data: data ?? [],
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
  };
}
