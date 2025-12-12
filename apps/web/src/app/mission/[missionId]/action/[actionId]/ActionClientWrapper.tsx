"use client";
import { toast } from "@/components/common/Toast";
import { ExtendedActionStepConfig, createActionSteps } from "@/constants/action";
import { SURVEY_TOAST_MESSAGE } from "@/constants/missionMessages";
import { ROUTES } from "@/constants/routes";
import { useReadActionsDetail } from "@/hooks/action/useReadActionsDetail";
import { useMissionSurveyToast } from "@/hooks/mission/useMissionSurveyToast";
import {
  useReadMissionResponseForMission,
  useStartSurveyResponse,
  useSubmitQuestionAnswer,
  useSubmitSurveyAnswers,
} from "@/hooks/mission-response";
import { removeSessionStorage } from "@/lib/sessionStorage";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import type { ActionAnswer } from "@/types/dto/action-answer";
import { StepProvider, useModal, useStep } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionImage,
  ActionTag,
  MissionRatingScale,
  MissionStarScale,
  MultipleChoice,
  Subjective,
} from "./ui";

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
  dehydratedState: DehydratedState;
}

export function ActionClientWrapper({ dehydratedState }: ActionClientWrapperProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <ActionContent />
    </HydrationBoundary>
  );
}

function ActionContent() {
  const { missionId, actionId } = useParams<{ missionId: string; actionId: string }>();
  const { data: actions } = useReadActionsDetail(missionId);

  const steps = createActionSteps({
    actions: actions.data,
    stepComponents: {
      MultipleChoice: MultipleChoice,
      Scale: MissionRatingScale,
      Subjective: Subjective,
      Rating: MissionStarScale,
      Image: ActionImage,
      Tag: ActionTag,
    },
  });

  const initialStep = steps.findIndex(
    step => (step as ExtendedActionStepConfig).actionData.id === actionId,
  );

  return (
    <StepProvider syncWithUrl steps={steps} initialStep={initialStep >= 0 ? initialStep : 0}>
      <ActionRenderer totalActionCount={actions.data.length} />
    </StepProvider>
  );
}

function ActionRenderer({ totalActionCount }: { totalActionCount: number }) {
  const router = useRouter();
  const { missionId } = useParams<{ missionId: string }>();
  const [responseId, setResponseId] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<ActionAnswerItem | null>(null);
  const { showModal, close } = useModal();

  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });

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

  const { mutateAsync: submitAnswer, isPending: isSubmittingAnswer } = useSubmitQuestionAnswer({
    onSuccess: () => {
      goNext();
    },
    onError: () => {
      toast.warning("답변 저장에 실패했습니다.", { id: "submit-answer-error" });
    },
    missionId,
  });

  const { mutateAsync: completeSurveyAsync, isPending: isCompletingSurvey } =
    useSubmitSurveyAnswers({
      onSuccess: () => {
        removeSessionStorage(toastStorageKey);
        router.push(ROUTES.MISSION_DONE(missionId));
      },
      onError: () => {
        toast.warning(SURVEY_TOAST_MESSAGE.error.message, { id: SURVEY_TOAST_MESSAGE.error.id });
      },
      missionId,
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
  } = useStep();

  const showExitConfirmModal = useCallback(() => {
    showModal({
      ...SURVEY_EXIT_MODAL,
      showCancelButton: true,
      onConfirm: () => {
        close();
      },
      onCancel: () => {
        close();
        router.push(ROUTES.MISSION(missionId));
      },
    });
  }, [missionId, showModal, close, router]);

  const stepConfig = currentStepConfig as unknown as ExtendedActionStepConfig;
  const ContentComponent = stepConfig.content;
  const actionData = stepConfig.actionData;

  const currentOrder = actionData.order;

  useMissionSurveyToast({
    currentOrder,
    totalActionCount,
    toastStorageKey,
  });

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

  const isAnswerSameAsSubmitted = useCallback(
    (answer: ActionAnswerItem, submittedAnswers: ActionAnswer[]): boolean => {
      const answersForAction = submittedAnswers.filter(
        submitted => submitted.actionId === answer.actionId,
      );

      if (answersForAction.length === 0) {
        return false;
      }

      if (answer.type === ActionType.MULTIPLE_CHOICE || answer.type === ActionType.TAG) {
        const submittedOptionIds = answersForAction
          .map(a => a.optionId)
          .filter((id): id is string => id !== null)
          .sort();
        const currentOptionIds = [...answer.selectedOptionIds].sort();
        return (
          submittedOptionIds.length === currentOptionIds.length &&
          submittedOptionIds.every((id, index) => id === currentOptionIds[index])
        );
      }

      if (answer.type === ActionType.SCALE || answer.type === ActionType.RATING) {
        const submittedScaleValue = answersForAction[0]?.scaleAnswer;
        return submittedScaleValue !== null && submittedScaleValue === answer.scaleValue;
      }

      if (answer.type === ActionType.SUBJECTIVE || answer.type === ActionType.IMAGE) {
        const submittedTextAnswer = answersForAction[0]?.textAnswer;
        return submittedTextAnswer !== null && submittedTextAnswer === answer.textResponse;
      }

      return false;
    },
    [],
  );

  const handleNext = useCallback(async () => {
    if (!responseId || !currentAnswer) return;

    const validationResult = submitAnswerItemSchema.safeParse(currentAnswer);
    if (!validationResult.success) {
      const errorMessage =
        validationResult.error.issues[0]?.message || "답변 형식이 올바르지 않습니다.";
      toast.warning(errorMessage, { id: "answer-validation-error" });
      return;
    }

    const submittedAnswers = missionResponse?.data?.answers ?? [];
    const isSame = isAnswerSameAsSubmitted(currentAnswer, submittedAnswers);

    if (isSame) {
      goNext();
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
      await submitAnswer({
        responseId,
        answer: currentAnswer,
      });
    }
  }, [
    isLastStep,
    responseId,
    currentAnswer,
    submitAnswer,
    completeSurveyAsync,
    showModal,
    missionResponse,
    isAnswerSameAsSubmitted,
    goNext,
  ]);

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
      isNextDisabled={!canGoNext || isSubmittingAnswer || isCompletingSurvey}
      isLoading={isSubmittingAnswer || isCompletingSurvey}
      onPrevious={handlePrevious}
      onNext={handleNext}
      nextButtonText={isLastStep ? "제출하기" : "다음"}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={handleAnswerChange}
      missionResponse={missionResponse?.data ? missionResponse : undefined}
    />
  );
}
