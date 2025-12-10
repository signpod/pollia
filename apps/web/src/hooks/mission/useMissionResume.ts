import { ROUTES } from "@/constants/routes";
import { useModal } from "@repo/ui/components";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useResetMissionResponse } from "../mission-response/useResetMissionResponse";

interface UseMissionResumeParams {
  isEnabledToResume: boolean;
  nextActionId?: string;
  firstActionId?: string;
  missionId: string;
  responseId: string;
}

export function useSurveyResume({
  isEnabledToResume,
  nextActionId,
  firstActionId,
  missionId,
  responseId,
}: UseMissionResumeParams) {
  const { showModal } = useModal();
  const router = useRouter();
  const { mutate: resetMissionResponse } = useResetMissionResponse({ missionId });

  const showResumeModal = useCallback(() => {
    if (isEnabledToResume && nextActionId && firstActionId) {
      showModal({
        title: "설문을 계속 진행할까요?",
        description: "마지막 지점부터 바로 이어할 수 있어요.",
        confirmText: "이어서 진행",
        cancelText: "처음부터 다시",
        showCancelButton: true,
        onConfirm: () => {
          router.push(ROUTES.ACTION(nextActionId));
        },
        onCancel: () => {
          resetMissionResponse(responseId);
          router.push(ROUTES.ACTION(firstActionId));
        },
      });
      return true;
    }
    return false;
  }, [
    isEnabledToResume,
    showModal,
    nextActionId,
    firstActionId,
    router,
    resetMissionResponse,
    responseId,
  ]);

  return { showResumeModal };
}

export type UseSurveyResumeReturn = ReturnType<typeof useSurveyResume>;
