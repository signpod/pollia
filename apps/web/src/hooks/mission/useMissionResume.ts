import { ROUTES } from "@/constants/routes";
import { setActionNavCookie } from "@/lib/cookie";
import { useModal } from "@repo/ui/components";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
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
  const [isResuming, setIsResuming] = useState(false);
  const lastModalCallRef = useRef(0);
  const lastConfirmClickRef = useRef(0);
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
    // 이미 재개 조건이면 디바운스 중에도 true 반환 (새 미션 시작 방지)
    if (isEnabledToResume && nextActionId && firstActionId) {
      const now = Date.now();
      if (isResuming || now - lastModalCallRef.current < 500) {
        return true; // 디바운스 중이지만 재개 조건이므로 true 반환
      }
      lastModalCallRef.current = now;
      showModal({
        title: "이어서 진행할까요?",
        description: "최근 저장된 위치에서 이어할 수 있어요",
        confirmText: "이어서 진행",
        cancelText: "다시 시작",
        showCancelButton: true,
        onConfirm: () => {
          const now = Date.now();
          if (now - lastConfirmClickRef.current < 500) return;
          lastConfirmClickRef.current = now;
          setIsResuming(true);
          setActionNavCookie(missionId, "resume");
          router.push(ROUTES.ACTION({ missionId, actionId: nextActionId }));
        },
        onCancel: async () => {
          setIsResuming(true);
          setActionNavCookie(missionId, "initial");
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
    isResuming,
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

  return { showResumeModal, isResuming };
}

export type UseSurveyResumeReturn = ReturnType<typeof useSurveyResume>;
