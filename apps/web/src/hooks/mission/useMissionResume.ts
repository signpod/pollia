import { ROUTES } from "@/constants/routes";
import { setSessionStorage } from "@/lib/sessionStorage";
import { useModal } from "@repo/ui/components";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useResetMissionResponse } from "../mission-response/useResetMissionResponse";
import { useStartMissionResponse } from "../mission-response/useStartMissionResponse";

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
  const { mutateAsync: resetMissionResponse, isPending: isResetMissionResponsePending } =
    useResetMissionResponse({ missionId });
  const { mutateAsync: startResponse } = useStartMissionResponse({
    onSuccess: () => {
      if (firstActionId) {
        router.push(ROUTES.ACTION({ missionId, actionId: firstActionId }));
      }
    },
  });

  const showResumeModal = useCallback(() => {
    if (isEnabledToResume && nextActionId && firstActionId) {
      showModal({
        title: "미션을 계속 진행할까요?",
        description: "마지막 지점부터 바로 이어할 수 있어요.",
        confirmText: "이어서 진행",
        cancelText: "처음부터 다시",
        showCancelButton: true,
        onConfirm: () => {
          setSessionStorage(`current-action-id-${missionId}`, "resume");
          router.push(ROUTES.ACTION({ missionId, actionId: nextActionId }));
        },
        onCancel: async () => {
          await resetMissionResponse(responseId);
          await startResponse({ missionId });
        },
        cancelButtonIsLoading: isResetMissionResponsePending,
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
    isResetMissionResponsePending,
    missionId,
    startResponse,
  ]);

  return { showResumeModal };
}

export type UseSurveyResumeReturn = ReturnType<typeof useSurveyResume>;
