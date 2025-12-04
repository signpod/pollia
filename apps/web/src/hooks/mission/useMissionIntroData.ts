import { useReadActionIds, useReadMission } from "@/hooks/mission";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";

/**
 * 설문 인트로 페이지에 필요한 모든 데이터를 조회하는 훅
 */
export function useMissionIntroData(missionId: string) {
  const { data: mission } = useReadMission(missionId);
  const { data: actionIds } = useReadActionIds(missionId);
  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });

  const firstActionId = actionIds?.data?.actionIds?.[0];
  const isCompleted = !!missionResponse?.data?.completedAt;
  const lastActionIndex = missionResponse?.data?.answers?.length ?? 0;
  const nextActionId = actionIds?.data?.actionIds?.[lastActionIndex];
  const isEnabledToResume = !isCompleted && lastActionIndex > 0 && !!nextActionId;

  return {
    mission: mission?.data,
    actionIds: actionIds?.data.actionIds,
    missionResponse: missionResponse?.data,
    firstActionId,
    nextActionId,
    isCompleted,
    isEnabledToResume,
    lastActionIndex,
  };
}
