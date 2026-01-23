"use client";

import { ROUTES } from "@/constants/routes";
import { useReadActionIds } from "@/hooks/action";
import { setActionNavCookie } from "@/lib/cookie";
import type { MyMissionResponse } from "@/types/dto/mission-response";
import { ActionType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

type Answer = MyMissionResponse["answers"][number];

const isValidAnswer = (answer: Answer): boolean => {
  const { type, isRequired } = answer.action;

  if (!isRequired) {
    return true;
  }

  switch (type) {
    case ActionType.MULTIPLE_CHOICE:
    case ActionType.TAG:
      return answer.options.length > 0;

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

interface UseResumeToNextActionParams {
  missionId: string;
  answers: Answer[];
}

export function useResumeToNextAction({ missionId, answers }: UseResumeToNextActionParams) {
  const router = useRouter();
  const { data: actionIdsData, isLoading } = useReadActionIds(missionId);

  const allActionIds: string[] = actionIdsData?.data?.actionIds ?? [];
  const validActionIds = new Set(answers.filter(isValidAnswer).map(answer => answer.actionId));
  const nextActionIndex = allActionIds.findIndex(
    (actionId: string) => !validActionIds.has(actionId),
  );
  const nextActionId = nextActionIndex === -1 ? allActionIds[0] : allActionIds[nextActionIndex];

  const resumeToNextAction = useCallback(() => {
    if (!nextActionId) return;

    setActionNavCookie(missionId, "resume");
    router.push(ROUTES.ACTION({ missionId, actionId: nextActionId }));
  }, [missionId, nextActionId, router]);

  return {
    nextActionId,
    resumeToNextAction,
    isReady: !isLoading && allActionIds.length > 0,
    isLoading,
  };
}

export type UseResumeToNextActionReturn = ReturnType<typeof useResumeToNextAction>;
