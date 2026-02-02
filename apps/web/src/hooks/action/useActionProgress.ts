import { useMemo } from "react";

export interface ActionForProgress {
  id: string;
  order: number | null;
  nextActionId?: string | null;
  nextCompletionId?: string | null;
  options: Array<{ id: string; nextActionId?: string | null; nextCompletionId?: string | null }>;
}

export interface SubmittedAnswerForProgress {
  actionId: string;
  options: Array<{ id: string; nextActionId?: string | null; nextCompletionId?: string | null }>;
}

interface ProgressInfo {
  currentOrder: number;
  totalCount: number;
}

function findRootAction(actions: ActionForProgress[]): ActionForProgress | null {
  if (actions.length === 0) return null;

  const firstAction = actions[0];
  if (!firstAction) return null;

  return actions.reduce<ActionForProgress>((min, action) => {
    const minOrder = min.order ?? Number.POSITIVE_INFINITY;
    const currentOrder = action.order ?? Number.POSITIVE_INFINITY;
    return currentOrder < minOrder ? action : min;
  }, firstAction);
}

function getNextActionId(
  action: ActionForProgress,
  submittedAnswerMap: Map<string, SubmittedAnswerForProgress>,
  actions: ActionForProgress[],
): string | null {
  const submittedAnswer = submittedAnswerMap.get(action.id);

  if (submittedAnswer?.options?.length) {
    const selectedOption = submittedAnswer.options[0];
    if (selectedOption?.nextCompletionId) {
      return null;
    }
    if (selectedOption?.nextActionId) {
      return selectedOption.nextActionId;
    }
  }

  if (action.nextCompletionId) {
    return null;
  }

  if (action.nextActionId) {
    return action.nextActionId;
  }

  const currentOrder = action.order ?? 0;
  const nextAction = actions.find(a => (a.order ?? 0) === currentOrder + 1);
  return nextAction?.id ?? null;
}

function calculatePathFromRoot(
  targetActionId: string,
  actions: ActionForProgress[],
  submittedAnswerMap: Map<string, SubmittedAnswerForProgress>,
): number {
  const root = findRootAction(actions);
  if (!root) return 1;

  let currentId: string | null = root.id;
  let pathLength = 0;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    pathLength++;

    if (currentId === targetActionId) {
      return pathLength;
    }

    const currentAction = actions.find(a => a.id === currentId);
    if (!currentAction) break;

    currentId = getNextActionId(currentAction, submittedAnswerMap, actions);
  }

  return pathLength;
}

function getAllPossibleNextIds(action: ActionForProgress, actions: ActionForProgress[]): string[] {
  const nextIds: string[] = [];

  for (const option of action.options) {
    if (option.nextActionId && !option.nextCompletionId) {
      nextIds.push(option.nextActionId);
    }
  }

  if (action.nextActionId && !action.nextCompletionId) {
    if (!nextIds.includes(action.nextActionId)) {
      nextIds.push(action.nextActionId);
    }
  }

  if (nextIds.length === 0 && !action.nextCompletionId) {
    const currentOrder = action.order ?? 0;
    const nextAction = actions.find(a => (a.order ?? 0) === currentOrder + 1);
    if (nextAction) {
      nextIds.push(nextAction.id);
    }
  }

  return nextIds;
}

function calculateMaxDistanceBFS(startActionId: string, actions: ActionForProgress[]): number {
  const actionMap = new Map(actions.map(a => [a.id, a]));
  let maxDistance = 0;

  const queue: Array<{ id: string; distance: number }> = [{ id: startActionId, distance: 0 }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;

    const { id, distance } = item;

    if (visited.has(id)) continue;
    visited.add(id);

    maxDistance = Math.max(maxDistance, distance);

    const action = actionMap.get(id);
    if (!action) continue;

    const nextIds = getAllPossibleNextIds(action, actions);
    for (const nextId of nextIds) {
      if (!visited.has(nextId)) {
        queue.push({ id: nextId, distance: distance + 1 });
      }
    }
  }

  return maxDistance + 1;
}

function buildSubmittedAnswerMap(
  submittedAnswers: SubmittedAnswerForProgress[] | undefined,
): Map<string, SubmittedAnswerForProgress> {
  const map = new Map<string, SubmittedAnswerForProgress>();
  if (!submittedAnswers) return map;

  for (const answer of submittedAnswers) {
    map.set(answer.actionId, answer);
  }

  return map;
}

function calculateProgressInfo(
  currentActionId: string,
  actions: ActionForProgress[],
  submittedAnswers: SubmittedAnswerForProgress[] | undefined,
): ProgressInfo {
  if (actions.length === 0) {
    return { currentOrder: 1, totalCount: 1 };
  }

  const submittedAnswerMap = buildSubmittedAnswerMap(submittedAnswers);

  const currentOrder = calculatePathFromRoot(currentActionId, actions, submittedAnswerMap);

  const maxDistanceFromCurrent = calculateMaxDistanceBFS(currentActionId, actions);

  const totalCount = currentOrder + maxDistanceFromCurrent - 1;

  return { currentOrder, totalCount };
}

interface UseActionProgressParams {
  actionId: string;
  actions: ActionForProgress[];
  submittedAnswers?: SubmittedAnswerForProgress[];
}

export function useActionProgress({
  actionId,
  actions,
  submittedAnswers,
}: UseActionProgressParams): ProgressInfo {
  return useMemo(() => {
    return calculateProgressInfo(actionId, actions, submittedAnswers);
  }, [actionId, actions, submittedAnswers]);
}

export type UseActionProgressReturn = ReturnType<typeof useActionProgress>;
