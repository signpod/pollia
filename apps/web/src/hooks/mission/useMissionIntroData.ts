import { useReadActionIds, useReadMission } from "@/hooks/mission";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import type { GetMissionResponseResponse } from "@/types/dto";
import { ActionType } from "@prisma/client";

type Answer = NonNullable<GetMissionResponseResponse["data"]>["answers"][number];

const isValidAnswer = (answer: Answer): boolean => {
  const { type, isRequired } = answer.action;

  if (!isRequired) {
    return true;
  }

  switch (type) {
    case ActionType.MULTIPLE_CHOICE:
    case ActionType.TAG: {
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
 * 설문 인트로 페이지에 필요한 모든 데이터를 조회하는 훅
 */
export function useMissionIntroData(missionId: string) {
  const { data: mission } = useReadMission(missionId);
  const { data: actionIds } = useReadActionIds(missionId);
  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });

  const firstActionId = actionIds?.data?.actionIds?.[0];
  const isCompleted = missionResponse?.data?.completedAt != null;

  const answers = missionResponse?.data?.answers ?? [];
  const validActionIds = new Set(answers.filter(isValidAnswer).map(answer => answer.actionId));

  const allActionIds = actionIds?.data?.actionIds ?? [];
  const nextActionIndex = allActionIds.findIndex(actionId => !validActionIds.has(actionId));
  const nextActionId = nextActionIndex === -1 ? undefined : allActionIds[nextActionIndex];
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
    nextActionIndex,
    isRequirePassword,
  };
}
