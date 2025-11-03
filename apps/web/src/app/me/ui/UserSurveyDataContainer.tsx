"use client";

import { useReadSurvey } from "@/hooks/survey/useReadSurvey";
import { GetUserSurveysResponse } from "@/types/dto";
import { ReactNode } from "react";

interface UserSurveyDataContainerProps {
  children: (data: {
    data: GetUserSurveysResponse["data"];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
  }) => ReactNode;
}

export function UserSurveyDataContainer({ children }: UserSurveyDataContainerProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useUserSurveyData();

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

function useUserSurveyData() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useReadSurvey();

  const flatData = data?.pages.flatMap(page => page.data) ?? [];

  return {
    data: flatData,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
  };
}
