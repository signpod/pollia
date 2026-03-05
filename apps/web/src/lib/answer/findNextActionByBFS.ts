import type { ActionDetail } from "@/types/dto";
import { ActionType } from "@prisma/client";

interface BFSAnswer {
  actionId: string;
  action: {
    type: string;
    isRequired: boolean;
  };
  options: Array<{ id: string }>;
  scaleAnswer: number | null;
  textAnswer: string | null;
  fileUploads: Array<unknown>;
  dateAnswers: Array<unknown>;
}

export function isValidAnswer(answer: BFSAnswer): boolean {
  const { type, isRequired } = answer.action;

  if (!isRequired) {
    return true;
  }

  switch (type) {
    case ActionType.MULTIPLE_CHOICE:
    case ActionType.TAG:
    case ActionType.BRANCH: {
      const hasOptions = answer.options.length > 0;
      const hasTextAnswer = answer.textAnswer != null && answer.textAnswer.trim() !== "";
      return hasOptions || hasTextAnswer;
    }

    case ActionType.SCALE:
    case ActionType.RATING:
      return answer.scaleAnswer !== null;

    case ActionType.SUBJECTIVE:
    case ActionType.SHORT_TEXT:
      return answer.textAnswer !== null;

    case ActionType.IMAGE:
    case ActionType.VIDEO:
    case ActionType.PDF:
      return answer.fileUploads.length > 0;

    case ActionType.DATE:
    case ActionType.TIME:
      return answer.dateAnswers.length > 0;

    default:
      return true;
  }
}

interface FindNextActionResult {
  nextActionId: string | undefined;
  lastAnsweredActionId: string | undefined;
  answeredCount: number;
}

export function findNextActionByBFS(
  firstActionId: string | undefined,
  actions: ActionDetail[],
  answers: BFSAnswer[],
): FindNextActionResult {
  if (!firstActionId || actions.length === 0) {
    return { nextActionId: firstActionId, lastAnsweredActionId: undefined, answeredCount: 0 };
  }

  const answerMap = new Map<string, BFSAnswer>();
  for (const answer of answers) {
    if (isValidAnswer(answer)) {
      answerMap.set(answer.actionId, answer);
    }
  }

  const actionMap = new Map<string, ActionDetail>();
  for (const action of actions) {
    actionMap.set(action.id, action);
  }

  const visited = new Set<string>();
  let currentActionId: string | undefined = firstActionId;
  let lastAnsweredActionId: string | undefined;
  let answeredCount = 0;

  while (currentActionId && !visited.has(currentActionId)) {
    visited.add(currentActionId);

    const answer = answerMap.get(currentActionId);
    if (!answer) {
      return { nextActionId: currentActionId, lastAnsweredActionId, answeredCount };
    }

    lastAnsweredActionId = currentActionId;
    answeredCount++;

    const action = actionMap.get(currentActionId);
    if (!action) {
      return { nextActionId: undefined, lastAnsweredActionId, answeredCount };
    }

    let nextId: string | undefined;

    if (
      answer.action.type === ActionType.MULTIPLE_CHOICE ||
      answer.action.type === ActionType.TAG ||
      answer.action.type === ActionType.BRANCH
    ) {
      const selectedOptionIds = new Set(answer.options.map(opt => opt.id));
      const selectedOption = action.options.find(opt => selectedOptionIds.has(opt.id));

      if (selectedOption?.nextCompletionId) {
        return { nextActionId: undefined, lastAnsweredActionId, answeredCount };
      }
      nextId = selectedOption?.nextActionId ?? action.nextActionId ?? undefined;
    } else {
      if (action.nextCompletionId) {
        return { nextActionId: undefined, lastAnsweredActionId, answeredCount };
      }
      nextId = action.nextActionId ?? undefined;
    }

    if (!nextId) {
      const currentOrder = action.order ?? 0;
      const nextAction = actions.find(a => (a.order ?? 0) === currentOrder + 1);
      nextId = nextAction?.id;
    }

    if (!nextId) {
      return { nextActionId: undefined, lastAnsweredActionId, answeredCount };
    }

    currentActionId = nextId;
  }

  return { nextActionId: currentActionId, lastAnsweredActionId, answeredCount };
}
