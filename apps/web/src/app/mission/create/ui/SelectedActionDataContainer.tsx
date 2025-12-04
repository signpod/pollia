"use client";

import { selectedActionAtom } from "@/atoms/mission/missionAtoms";
import { ActionSummary } from "@/types/domain/action";
import { useAtomValue } from "jotai";
import { ReactNode, useMemo } from "react";

interface SelectedActionDataContainerProps {
  children: (data: { actions: ActionSummary[] }) => ReactNode;
}

export function SelectedActionDataContainer({ children }: SelectedActionDataContainerProps) {
  const { actions } = useSelectedActionData();

  return <>{children({ actions: actions ?? [] })}</>;
}

function useSelectedActionData() {
  const selectedQuestions = useAtomValue(selectedActionAtom);

  const sortedActions = useMemo(() => {
    if (!selectedQuestions) return [];

    return selectedQuestions;
  }, [selectedQuestions]);

  return {
    actions: sortedActions,
  };
}
