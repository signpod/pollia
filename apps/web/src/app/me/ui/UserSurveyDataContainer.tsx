"use client";

import { useReadMissions } from "@/hooks/mission";
import { GetUserMissionsResponse } from "@/types/dto";
import { ReactNode } from "react";

interface UserSurveyDataContainerProps {
  children: (data: {
    data: GetUserMissionsResponse["data"];
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
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useReadMissions();

  const flatData = data?.pages.flatMap(page => page.data) ?? [];

  return {
    data: flatData,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
  };
}
