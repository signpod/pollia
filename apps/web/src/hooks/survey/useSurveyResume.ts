import { ROUTES } from "@/constants/routes";
import { useModal } from "@repo/ui/components";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UseSurveyResumeParams {
  isEnabledToResume: boolean;
  nextQuestionId?: string;
  firstQuestionId?: string;
}

export function useSurveyResume({
  isEnabledToResume,
  nextQuestionId,
  firstQuestionId,
}: UseSurveyResumeParams) {
  const { showModal } = useModal();
  const router = useRouter();

  useEffect(() => {
    if (isEnabledToResume && nextQuestionId && firstQuestionId) {
      showModal({
        title: "설문을 계속 진행할까요?",
        description: "마지막 지점부터 바로 이어할 수 있어요.",
        confirmText: "이어서 진행",
        cancelText: "처음부터 다시",
        showCancelButton: true,
        onConfirm: () => {
          router.push(ROUTES.SURVEY_QUESTION(nextQuestionId));
        },
        onCancel: () => {
          router.push(ROUTES.SURVEY_QUESTION(firstQuestionId));
        },
      });
    }
  }, [isEnabledToResume, showModal, nextQuestionId, firstQuestionId, router]);
}
