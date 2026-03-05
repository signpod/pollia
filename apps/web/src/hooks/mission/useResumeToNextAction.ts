"use client";

import { ROUTES } from "@/constants/routes";
import { useReadActionIds } from "@/hooks/action/useReadActionIds";
import { useReadActionsDetail } from "@/hooks/action/useReadActionsDetail";
import { useReadMission } from "@/hooks/mission/useReadMission";
import { findNextActionByBFS } from "@/lib/answer/findNextActionByBFS";
import { setActionNavCookie } from "@/lib/cookie";
import type { MyMissionResponse } from "@/types/dto/mission-response";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

type Answer = MyMissionResponse["answers"][number];

interface UseResumeToNextActionParams {
  missionId: string;
  answers: Answer[];
}

export function useResumeToNextAction({ missionId, answers }: UseResumeToNextActionParams) {
  const router = useRouter();
  const { data: missionData } = useReadMission(missionId);
  const { data: actionIdsData, isLoading: isActionIdsLoading } = useReadActionIds(missionId);
  const { data: actionsData, isLoading: isActionsLoading } = useReadActionsDetail(missionId);

  const allActionIds: string[] = actionIdsData?.data?.actionIds ?? [];
  const actions = actionsData?.data ?? [];
  const firstActionId = missionData?.data.entryActionId ?? allActionIds[0];

  const {
    nextActionId: bfsNextActionId,
    lastAnsweredActionId,
    answeredCount,
  } = findNextActionByBFS(firstActionId, actions, answers);

  const nextActionId = bfsNextActionId ?? lastAnsweredActionId;

  const isLoading = isActionIdsLoading || isActionsLoading;

  const resumeToNextAction = useCallback(() => {
    if (!nextActionId) return;

    setActionNavCookie(missionId, "resume");
    router.push(ROUTES.ACTION({ missionId, actionId: nextActionId }));
  }, [missionId, nextActionId, router]);

  return {
    nextActionId,
    resumeToNextAction,
    isReady: !isLoading && allActionIds.length > 0 && actions.length > 0,
    isLoading,
    answeredCount,
  };
}

export type UseResumeToNextActionReturn = ReturnType<typeof useResumeToNextAction>;
