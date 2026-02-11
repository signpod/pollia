"use client";

import { ROUTES } from "@/constants/routes";
import type { MyMissionResponseAnswer } from "@/types/dto/mission-response";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface UseNavigateToDoneParams {
  missionId: string;
  answers: MyMissionResponseAnswer[];
}

function resolveCompletionId(answers: MyMissionResponseAnswer[]): string | undefined {
  for (const answer of answers) {
    for (const option of answer.options) {
      if (option.nextCompletionId) {
        return option.nextCompletionId;
      }
    }

    if (answer.action.nextCompletionId) {
      return answer.action.nextCompletionId;
    }
  }

  return undefined;
}

export function useNavigateToDone({ missionId, answers }: UseNavigateToDoneParams) {
  const router = useRouter();

  const navigateToDone = useCallback(() => {
    const completionId = resolveCompletionId(answers);
    router.push(ROUTES.MISSION_DONE(missionId, completionId));
  }, [missionId, answers, router]);

  return { navigateToDone };
}

export type UseNavigateToDoneReturn = ReturnType<typeof useNavigateToDone>;
