"use client";
import { toast } from "@/components/common/Toast";
import { ExtendedActionStepConfig, createActionSteps } from "@/constants/action";
import { SURVEY_TOAST_MESSAGE } from "@/constants/missionMessages";
import { ROUTES } from "@/constants/routes";
import { useReadActionsDetail } from "@/hooks/action/useReadActionsDetail";
import {
  useReadMissionResponseForMission,
  useStartSurveyResponse,
  useSubmitQuestionAnswer,
  useSubmitSurveyAnswers,
} from "@/hooks/mission-response";
import {
  getSessionStorageJSON,
  removeSessionStorage,
  setSessionStorageJSON,
} from "@/lib/sessionStorage";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import type { ActionAnswerItem } from "@/types/dto";
import { StepProvider, useModal, useStep } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MultipleChoice, Scale, Subjective } from "./ui";

const SURVEY_EXIT_MODAL = {
  title: "설문을 종료하실 건가요?",
  description: "이 페이지를 벗어나면 저장된 내용이 사라져요.",
  confirmText: "계속하기",
  cancelText: "종료하기",
} as const;

const SURVEY_SUBMIT_MODAL = {
  title: "응답을 제출할까요?",
  description: "제출 이후에는 답변을 수정하거나\n다시 응답할 수 없어요",
  confirmText: "제출하기",
  cancelText: "취소",
} as const;

interface ActionClientWrapperProps {
  missionId: string;
  dehydratedState: DehydratedState;
  currentActionId: string;
}

export function ActionClientWrapper({
  missionId,
  dehydratedState,
  currentActionId,
}: ActionClientWrapperProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <ActionContent missionId={missionId} currentActionId={currentActionId} />
    </HydrationBoundary>
  );
}

function ActionContent({
  missionId,
  currentActionId,
}: { missionId: string; currentActionId: string }) {
  const { data: actions } = useReadActionsDetail(missionId);

  const steps = createActionSteps({
    actions: actions.data,
    stepComponents: {
      MultipleChoice: MultipleChoice,
      Scale: Scale,
      Subjective: Subjective,
    },
  });

  const initialStep = steps.findIndex(
    step => (step as ExtendedActionStepConfig).actionData.id === currentActionId,
  );

  return (
    <StepProvider syncWithUrl steps={steps} initialStep={initialStep >= 0 ? initialStep : 0}>
      <ActionRenderer totalActionCount={actions.data.length} missionId={missionId} />
    </StepProvider>
  );
}

function ActionRenderer({
  totalActionCount,
  missionId,
}: {
  totalActionCount: number;
  missionId: string;
}) {
  const router = useRouter();
  const [responseId, setResponseId] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<ActionAnswerItem | null>(null);
  const { showModal, close } = useModal();

  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });

  const isExitingRef = useRef(false);
  const toastStorageKey = `mission-toast-${missionId}`;

  const { mutate: startResponse } = useStartSurveyResponse({
    onSuccess: data => {
      setResponseId(data.data.id);
    },
    onError: () => {
      toast.warning("설문 응답을 시작할 수 없습니다.", { id: "init-error" });
      router.push(ROUTES.MISSION(missionId));
    },
  });

  const { mutate: submitAnswer, isPending: isSubmittingAnswer } = useSubmitQuestionAnswer({
    onSuccess: () => {
      goNext();
    },
    onError: () => {
      toast.warning("답변 저장에 실패했습니다.", { id: "submit-answer-error" });
    },
    missionId,
  });

  const { mutateAsync: completeSurveyAsync } = useSubmitSurveyAnswers({
    onSuccess: () => {
      removeSessionStorage(toastStorageKey);
      router.push(ROUTES.MISSION_DONE(missionId));
    },
    onError: () => {
      toast.warning(SURVEY_TOAST_MESSAGE.error.message, { id: SURVEY_TOAST_MESSAGE.error.id });
    },
  });

  const {
    currentStep,
    currentStepConfig,
    goNext,
    goBack,
    isFirstStep,
    isLastStep,
    canGoNext,
    updateStepConfig,
    steps,
  } = useStep();

  const showExitConfirmModal = useCallback(() => {
    showModal({
      ...SURVEY_EXIT_MODAL,
      showCancelButton: true,
      onConfirm: () => {
        close();
      },
      onCancel: () => {
        isExitingRef.current = true;
        close();
        window.history.go(-1);
        setTimeout(() => {
          router.push(ROUTES.MISSION(missionId));
        }, 100);
      },
    });
  }, [missionId, showModal, close, router]);

  useEffect(() => {
    const handleBackPressed = () => {
      if (isExitingRef.current) {
        return;
      }
      if (isFirstStep) {
        showExitConfirmModal();
      } else {
        goBack();
      }
    };

    window.addEventListener("action-back-pressed", handleBackPressed);
    return () => {
      window.removeEventListener("action-back-pressed", handleBackPressed);
    };
  }, [isFirstStep, showExitConfirmModal, goBack]);

  const stepConfig = currentStepConfig as unknown as ExtendedActionStepConfig;
  const ContentComponent = stepConfig.content;
  const actionData = stepConfig.actionData;

  // actionData.id가 변경될 때 currentStep을 동기화
  useEffect(() => {
    const stepIndex = steps.findIndex(
      step => (step as ExtendedActionStepConfig).actionData.id === actionData.id,
    );
    if (stepIndex >= 0 && stepIndex !== currentStep) {
      // URL이 변경되어 step이 변경된 경우, canGoNext를 초기화하지 않음
      // 각 컴포넌트가 자신의 canGoNext를 설정할 것임
    }
  }, [actionData.id, steps, currentStep]);

  const lastToastQuestionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastToastQuestionIdRef.current === actionData.id) {
      return;
    }

    lastToastQuestionIdRef.current = actionData.id;

    const currentOrder = actionData.order;
    const progressValue = (currentOrder / totalActionCount) * 100 || 0;

    const isFirstQuestion = currentOrder === 1;
    const isFinalQuestion = currentOrder === totalActionCount && totalActionCount > 1;
    const isHalfway = progressValue >= 50 && totalActionCount > 2;

    const toastState = getSessionStorageJSON(toastStorageKey, {
      first: false,
      half: false,
      final: false,
    });

    if (isFirstQuestion && !toastState.first) {
      setSessionStorageJSON(toastStorageKey, { ...toastState, first: true });
      toast.default(SURVEY_TOAST_MESSAGE.first.message, {
        id: SURVEY_TOAST_MESSAGE.first.id,
        duration: 4000,
      });
      return;
    }

    if (isFinalQuestion && !toastState.final) {
      setSessionStorageJSON(toastStorageKey, { ...toastState, final: true });
      toast.default(SURVEY_TOAST_MESSAGE.final.message, {
        id: SURVEY_TOAST_MESSAGE.final.id,
        duration: 4000,
      });
      return;
    }

    if (isHalfway && !toastState.half) {
      setSessionStorageJSON(toastStorageKey, { ...toastState, half: true });
      toast.default(SURVEY_TOAST_MESSAGE.half.message, {
        id: SURVEY_TOAST_MESSAGE.half.id,
        duration: 4000,
      });
      return;
    }
  }, [actionData.id, actionData.order, totalActionCount, toastStorageKey]);

  const updateCanGoNext = useCallback(
    (canGoNext: boolean) => {
      updateStepConfig(currentStep, { canGoNext });
    },
    [currentStep, updateStepConfig],
  );

  const handleAnswerChange = useCallback((answer: ActionAnswerItem) => {
    setCurrentAnswer(answer);
  }, []);

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startResponse({ surveyId: missionId });
    }
  }, [missionId, startResponse]);

  const handleNext = useCallback(() => {
    if (!responseId || !currentAnswer) return;

    const validationResult = submitAnswerItemSchema.safeParse(currentAnswer);
    if (!validationResult.success) {
      const errorMessage =
        validationResult.error.issues[0]?.message || "답변 형식이 올바르지 않습니다.";
      toast.warning(errorMessage, { id: "answer-validation-error" });
      return;
    }

    if (isLastStep) {
      showModal({
        ...SURVEY_SUBMIT_MODAL,
        showCancelButton: true,
        onConfirm: async () => {
          await completeSurveyAsync({
            responseId,
            answers: [currentAnswer],
          });
        },
      });
    } else {
      submitAnswer({
        responseId,
        answer: currentAnswer,
      });
    }
  }, [isLastStep, responseId, currentAnswer, submitAnswer, completeSurveyAsync, showModal]);

  const handlePrevious = useCallback(() => {
    if (isFirstStep) {
      showExitConfirmModal();
    } else {
      goBack();
    }
  }, [isFirstStep, goBack, showExitConfirmModal]);

  return (
    <ContentComponent
      key={actionData.id}
      actionData={actionData}
      currentOrder={actionData.order}
      totalActionCount={totalActionCount}
      isFirstAction={isFirstStep}
      isNextDisabled={!canGoNext || isSubmittingAnswer}
      onPrevious={handlePrevious}
      onNext={handleNext}
      nextButtonText={isLastStep ? "제출하기" : "다음"}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={handleAnswerChange}
      missionResponse={missionResponse?.data ? missionResponse : undefined}
    />
  );
}
