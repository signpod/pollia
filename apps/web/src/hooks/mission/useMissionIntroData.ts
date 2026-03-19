import { useReadActionsDetail } from "@/hooks/action/useReadActionsDetail";
import { useReadActionIds, useReadMission } from "@/hooks/mission";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { findNextActionByBFS } from "@/lib/answer/findNextActionByBFS";
import { quizConfigSchema } from "@/schemas/mission/quizConfigSchema";
import { MissionCategory } from "@prisma/client";

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 설문 인트로 페이지에 필요한 모든 데이터를 조회하는 훅
 */
export function useMissionIntroData(missionId: string) {
  const { data: mission } = useReadMission(missionId);
  const { data: actionIds } = useReadActionIds(missionId);
  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });
  const { data: actionsData } = useReadActionsDetail(missionId);

  const isCompleted = missionResponse?.data?.completedAt != null;
  const answers = missionResponse?.data?.answers ?? [];
  const actions = actionsData?.data ?? [];
  const allActionIds = actionIds?.data?.actionIds;
  const defaultFirstActionId = mission?.data.entryActionId ?? allActionIds?.[0];

  const shuffleQuestions =
    mission?.data?.category === MissionCategory.QUIZ &&
    quizConfigSchema.safeParse(mission.data.quizConfig ?? {}).data?.shuffleQuestions === true;

  let firstActionId: string | undefined;
  let nextActionId: string | undefined;
  let answeredCount: number;

  if (shuffleQuestions && allActionIds && allActionIds.length > 0) {
    const submittedActionIds = new Set(answers.map(a => a.actionId));
    const unsubmittedIds = allActionIds.filter(id => !submittedActionIds.has(id));

    firstActionId = pickRandom(allActionIds);
    nextActionId = pickRandom(unsubmittedIds);
    answeredCount = submittedActionIds.size;
  } else {
    firstActionId = defaultFirstActionId;
    const bfsResult = findNextActionByBFS(defaultFirstActionId, actions, answers);
    nextActionId = bfsResult.nextActionId;
    answeredCount = bfsResult.answeredCount;
  }

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
