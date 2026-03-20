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

function findRootAction(
  actions: ActionForProgress[],
  entryActionId?: string | null,
): ActionForProgress | null {
  if (actions.length === 0) return null;

  if (entryActionId) {
    const entry = actions.find(a => a.id === entryActionId);
    if (entry) return entry;
  }

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
  entryActionId?: string | null,
): number {
  const root = findRootAction(actions, entryActionId);
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

function calculateMaxRemainingSteps(startActionId: string, actions: ActionForProgress[]): number {
  const actionMap = new Map(actions.map(a => [a.id, a]));
  const memo = new Map<string, number>();

  function getNextIds(action: ActionForProgress): string[] {
    const nextIds: string[] = [];
    let hasExplicitRouting = false;

    for (const option of action.options) {
      if (option.nextActionId || option.nextCompletionId) {
        hasExplicitRouting = true;
      }
      if (option.nextActionId && !option.nextCompletionId && actionMap.has(option.nextActionId)) {
        nextIds.push(option.nextActionId);
      }
    }

    if (action.nextActionId || action.nextCompletionId) {
      hasExplicitRouting = true;
    }

    if (action.nextActionId && !action.nextCompletionId && actionMap.has(action.nextActionId)) {
      if (!nextIds.includes(action.nextActionId)) {
        nextIds.push(action.nextActionId);
      }
    }

    if (!hasExplicitRouting && nextIds.length === 0) {
      const currentOrder = action.order ?? 0;
      const nextAction = actions.find(a => (a.order ?? 0) === currentOrder + 1);
      if (nextAction) {
        nextIds.push(nextAction.id);
      }
    }

    return nextIds;
  }

  function dfs(actionId: string, visiting: Set<string>): number {
    if (memo.has(actionId)) return memo.get(actionId)!;
    if (visiting.has(actionId)) return 0;

    const action = actionMap.get(actionId);
    if (!action) return 0;

    visiting.add(actionId);

    const nextIds = getNextIds(action);
    let maxChildSteps = 0;

    for (const nextId of nextIds) {
      maxChildSteps = Math.max(maxChildSteps, dfs(nextId, visiting));
    }

    visiting.delete(actionId);

    const result = 1 + maxChildSteps;
    memo.set(actionId, result);
    return result;
  }

  return dfs(startActionId, new Set());
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
  entryActionId?: string | null,
): ProgressInfo {
  if (actions.length === 0) {
    return { currentOrder: 1, totalCount: 1 };
  }

  const submittedAnswerMap = buildSubmittedAnswerMap(submittedAnswers);

  const currentOrder = calculatePathFromRoot(
    currentActionId,
    actions,
    submittedAnswerMap,
    entryActionId,
  );

  const remaining = calculateMaxRemainingSteps(currentActionId, actions);

  const totalCount = currentOrder + remaining - 1;

  return { currentOrder, totalCount };
}

export interface UseActionProgressParams {
  actionId: string;
  actions: ActionForProgress[];
  submittedAnswers?: SubmittedAnswerForProgress[];
  entryActionId?: string | null;
  shuffleQuestions?: boolean;
}

export function useActionProgress({
  actionId,
  actions,
  submittedAnswers,
  entryActionId,
  shuffleQuestions,
}: UseActionProgressParams): ProgressInfo {
  return useMemo(() => {
    if (shuffleQuestions) {
      const submittedCount = submittedAnswers?.length ?? 0;
      const isCurrentSubmitted = submittedAnswers?.some(a => a.actionId === actionId) ?? false;
      return {
        currentOrder: isCurrentSubmitted ? submittedCount : submittedCount + 1,
        totalCount: actions.length,
      };
    }
    return calculateProgressInfo(actionId, actions, submittedAnswers, entryActionId);
  }, [actionId, actions, submittedAnswers, entryActionId, shuffleQuestions]);
}

export type UseActionProgressReturn = ReturnType<typeof useActionProgress>;
