import { useReadActionsDetail } from "@/hooks/action/useReadActionsDetail";
import { useReadActionIds, useReadMission } from "@/hooks/mission";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import type { ActionDetail, GetMissionResponseResponse } from "@/types/dto";
import { ActionType } from "@prisma/client";

type Answer = NonNullable<GetMissionResponseResponse["data"]>["answers"][number];

const isValidAnswer = (answer: Answer): boolean => {
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
};

/**
 * BFS를 사용하여 사용자의 응답 경로를 따라 가장 깊게 응답한 질문의 다음 액션을 찾습니다.
 * 분기 처리가 있는 경우 선택한 옵션의 nextActionId를 따라갑니다.
 */
function findNextActionByBFS(
  firstActionId: string | undefined,
  actions: ActionDetail[],
  answers: Answer[],
): { nextActionId: string | undefined; answeredCount: number } {
  if (!firstActionId || actions.length === 0) {
    return { nextActionId: firstActionId, answeredCount: 0 };
  }

  const answerMap = new Map<string, Answer>();
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
  let answeredCount = 0;

  while (currentActionId && !visited.has(currentActionId)) {
    visited.add(currentActionId);

    const answer = answerMap.get(currentActionId);
    if (!answer) {
      return { nextActionId: currentActionId, answeredCount };
    }

    answeredCount++;

    const action = actionMap.get(currentActionId);
    if (!action) {
      return { nextActionId: undefined, answeredCount };
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
        return { nextActionId: undefined, answeredCount };
      }
      nextId = selectedOption?.nextActionId ?? action.nextActionId ?? undefined;
    } else {
      if (action.nextCompletionId) {
        return { nextActionId: undefined, answeredCount };
      }
      nextId = action.nextActionId ?? undefined;
    }

    if (!nextId) {
      const currentOrder = action.order ?? 0;
      const nextAction = actions.find(a => (a.order ?? 0) === currentOrder + 1);
      nextId = nextAction?.id;
    }

    if (!nextId) {
      return { nextActionId: undefined, answeredCount };
    }

    currentActionId = nextId;
  }

  return { nextActionId: currentActionId, answeredCount };
}

/**
 * 설문 인트로 페이지에 필요한 모든 데이터를 조회하는 훅
 */
export function useMissionIntroData(missionId: string) {
  const { data: mission } = useReadMission(missionId);
  const { data: actionIds } = useReadActionIds(missionId);
  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });
  const { data: actionsData } = useReadActionsDetail(missionId);

  const firstActionId = actionIds?.data?.actionIds?.[0];
  const isCompleted = missionResponse?.data?.completedAt != null;

  const answers = missionResponse?.data?.answers ?? [];
  const actions = actionsData?.data ?? [];

  const { nextActionId, answeredCount } = findNextActionByBFS(firstActionId, actions, answers);

  const hasStartedMission = missionResponse?.data != null;
  const isEnabledToResume = hasStartedMission && !isCompleted && nextActionId !== undefined;

  const isRequirePassword = mission?.data?.password !== null;

  return {
    mission: mission?.data,
    actionIds: actionIds?.data.actionIds,
    missionResponse: missionResponse?.data,
    firstActionId,
    nextActionId,
    isCompleted,
    isEnabledToResume,
    nextActionIndex: answeredCount,
    isRequirePassword,
  };
}
