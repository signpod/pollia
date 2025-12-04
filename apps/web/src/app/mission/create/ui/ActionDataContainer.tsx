"use client";

import { searchQueryAtom, selectedActionTypesAtom } from "@/atoms/mission/missionAtoms";
import { useReadActions } from "@/hooks/action/useReadActions";
import { ActionSummary } from "@/types/domain/action";
import { useAtomValue } from "jotai";
import { ReactNode, useMemo } from "react";
import { getSortedActions } from "../util/sortedAction";

interface ActionDataContainerProps {
  children: (data: { actions: ActionSummary[]; isLoading: boolean }) => ReactNode;
}

export function ActionDataContainer({ children }: ActionDataContainerProps) {
  const { actions, isLoading } = useActionData();

  return <>{children({ actions: actions ?? [], isLoading })}</>;
}

function useActionData() {
  const selectedActionTypes = useAtomValue(selectedActionTypesAtom);
  const searchQuery = useAtomValue(searchQueryAtom);

  const { data: actions, isLoading } = useReadActions({
    options: {
      searchQuery,
      selectedActionTypes: Array.from(selectedActionTypes),
      isDraft: true,
    },
  });

  const sortedActions = useMemo(() => {
    if (!actions) return [];

    return getSortedActions([...actions]);
  }, [actions]);

  return {
    actions: sortedActions,
    isLoading,
  };
}
