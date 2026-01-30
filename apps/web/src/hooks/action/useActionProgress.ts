import { useMemo } from "react";

export interface ActionForProgress {
  id: string;
  order: number | null;
  nextActionId?: string | null;
  nextCompletionId?: string | null;
  options: Array<{ id: string; nextActionId?: string | null; nextCompletionId?: string | null }>;
}

interface ProgressInfo {
  currentOrder: number;
  totalCount: number;
}

function calculateRemainingPath(
  currentActionId: string,
  actions: ActionForProgress[],
  submittedAnswerMap: Map<string, string[]>,
  visited: Set<string> = new Set(),
): number {
  if (visited.has(currentActionId)) return 0;
  visited.add(currentActionId);

  const currentAction = actions.find(a => a.id === currentActionId);
  if (!currentAction) return 0;

  let nextActionId: string | null | undefined = null;
  let hasCompletionId = false;

  const submittedOptionIds = submittedAnswerMap.get(currentActionId);
  if (submittedOptionIds?.length) {
    const selectedOptionId = submittedOptionIds[0];
    const selectedOption = currentAction.options.find(o => o.id === selectedOptionId);
    if (selectedOption?.nextCompletionId) {
      hasCompletionId = true;
    } else if (selectedOption?.nextActionId) {
      nextActionId = selectedOption.nextActionId;
    }
  }

  if (!nextActionId && !hasCompletionId && currentAction.nextCompletionId) {
    hasCompletionId = true;
  }

  if (!nextActionId && !hasCompletionId && currentAction.nextActionId) {
    nextActionId = currentAction.nextActionId;
  }

  if (!nextActionId && !hasCompletionId) {
    const currentOrder = currentAction.order ?? 0;
    const nextAction = actions.find(a => (a.order ?? 0) === currentOrder + 1);
    if (nextAction) {
      nextActionId = nextAction.id;
    }
  }

  if (!nextActionId || hasCompletionId) return 1;

  return 1 + calculateRemainingPath(nextActionId, actions, submittedAnswerMap, visited);
}

function calculateProgressInfo(currentActionId: string, actions: ActionForProgress[]): ProgressInfo {
  const currentAction = actions.find(a => a.id === currentActionId);
  const currentOrder = (currentAction?.order ?? 0) + 1;

  const answerMap = new Map<string, string[]>();
  const remainingPath = calculateRemainingPath(currentActionId, actions, answerMap);
  const totalCount = currentOrder + remainingPath - 1;

  return { currentOrder, totalCount };
}

interface UseActionProgressParams {
  actionId: string;
  actions: ActionForProgress[];
}

export function useActionProgress({ actionId, actions }: UseActionProgressParams): ProgressInfo {
  return useMemo(() => {
    return calculateProgressInfo(actionId, actions);
  }, [actionId, actions]);
}

export type UseActionProgressReturn = ReturnType<typeof useActionProgress>;
