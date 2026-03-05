import { useReadActionsDetail } from "@/hooks/action/useReadActionsDetail";
import { useReadActionIds, useReadMission } from "@/hooks/mission";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { findNextActionByBFS } from "@/lib/answer/findNextActionByBFS";

/**
 * 설문 인트로 페이지에 필요한 모든 데이터를 조회하는 훅
 */
export function useMissionIntroData(missionId: string) {
  const { data: mission } = useReadMission(missionId);
  const { data: actionIds } = useReadActionIds(missionId);
  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });
  const { data: actionsData } = useReadActionsDetail(missionId);

  const firstActionId = mission?.data.entryActionId ?? actionIds?.data?.actionIds?.[0];
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
