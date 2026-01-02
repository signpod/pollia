"use client";
import { toast } from "@/components/common/Toast";
import { ExtendedActionStepConfig, createActionSteps } from "@/constants/action";
import { MISSION_TOAST_MESSAGE } from "@/constants/missionMessages";
import { ROUTES } from "@/constants/routes";
import { useReadActionsDetail } from "@/hooks/action/useReadActionsDetail";
import {
  useReadMissionResponseForMission,
  useSubmitQuestionAnswer,
  useSubmitSurveyAnswers,
} from "@/hooks/mission-response";
import { useMissionSurveyToast } from "@/hooks/mission/useMissionSurveyToast";
import { useRecordActionResponse } from "@/hooks/tracking";
import { useAuth } from "@/hooks/user";
import { getSessionStorage, removeSessionStorage, setSessionStorage } from "@/lib/sessionStorage";
import { getOrCreateSessionId } from "@/lib/tracking";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import type { ActionAnswer } from "@/types/dto/action-answer";
import { StepProvider, useModal, useStep } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ActionImage,
  ActionPdf,
  ActionTag,
  ActionVideo,
  MissionRatingScale,
  MissionStarScale,
  MultipleChoice,
  Subjective,
} from "./ui";

const SURVEY_SUBMIT_MODAL = {
  title: "미션을 최종적으로 제출할까요?",
  description: "제출 이후에는 답변을 수정하거나\n다시 참여할 수 없어요",
  confirmText: "제출하기",
  cancelText: "취소",
} as const;

interface ActionClientWrapperProps {
  dehydratedState: DehydratedState;
}

const SCROLL_OFFSET = 30;

export function ActionClientWrapper({ dehydratedState }: ActionClientWrapperProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <ActionContent />
    </HydrationBoundary>
  );
}

function ActionContent() {
  const { missionId, actionId } = useParams<{ missionId: string; actionId: string }>();
  const router = useRouter();
  const { data: actions } = useReadActionsDetail(missionId);
  const actionsIds = actions.data.map(action => action.id);

  useEffect(() => {
    const actionIdBefore = getSessionStorage(`current-action-id-${missionId}`);
    const currentActionIdIndex = actionsIds.findIndex(id => id === actionId);
    const getIsActionIdBefore = () => {
      if (!actionIdBefore) return false;
      if (actionIdBefore === "initial") {
        return currentActionIdIndex === 0;
      }

      if (actionIdBefore === "resume") return true;

      return (
        Math.abs(currentActionIdIndex - actionsIds.findIndex(id => id === actionIdBefore)) <= 1
      );
    };

    const isActionIdBefore = getIsActionIdBefore();

    if (!isActionIdBefore) {
      router.replace(ROUTES.MISSION(missionId));
      return;
    }

    window.scrollTo(0, -SCROLL_OFFSET);
    document.documentElement.scrollTop = -SCROLL_OFFSET;
    document.body.scrollTop = -SCROLL_OFFSET;

    setSessionStorage(`current-action-id-${missionId}`, actionId);
  }, [actionsIds, actionId, missionId, router]);

  const steps = createActionSteps({
    actions: actions.data,
    stepComponents: {
      MultipleChoice: MultipleChoice,
      Scale: MissionRatingScale,
      Subjective: Subjective,
      Rating: MissionStarScale,
      Image: ActionImage,
      Video: ActionVideo,
      Tag: ActionTag,
      Pdf: ActionPdf,
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
  const [currentAnswer, setCurrentAnswer] = useState<ActionAnswerItem | null>(null);
  const { showModal } = useModal();
  const { user } = useAuth();

  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });
  const { mutate: recordResponse } = useRecordActionResponse();

  const toastStorageKey = `mission-toast-${missionId}`;

  const { mutateAsync: submitAnswer, isPending: isSubmittingAnswer } = useSubmitQuestionAnswer({
    onSuccess: () => {
      goNext();

      // Fire-and-forget 방식으로 트래킹 [25.12.22/러기]
      if (currentAnswer) {
        recordResponse({
          missionId,
          sessionId: getOrCreateSessionId(),
          userId: user.id || undefined,
          actionId: currentAnswer.actionId,
          metadata: {
            actionType: currentAnswer.type,
          },
        });
      }
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

        if (currentAnswer) {
          recordResponse({
            missionId,
            sessionId: getOrCreateSessionId(),
            userId: user.id || undefined,
            actionId: currentAnswer.actionId,
            metadata: {
              actionType: currentAnswer.type,
              isFinalSubmit: true,
            },
          });
        }
      },
      onError: () => {
        toast.warning(MISSION_TOAST_MESSAGE.error.message, { id: MISSION_TOAST_MESSAGE.error.id });
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

  const responseId = missionResponse?.data?.id ?? "";

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

      if (answer.type === ActionType.SUBJECTIVE || answer.type === ActionType.SHORT_TEXT) {
        const submittedTextAnswer = answersForAction[0]?.textAnswer;
        return submittedTextAnswer !== null && submittedTextAnswer === answer.textAnswer;
      }

      if (
        answer.type === ActionType.IMAGE ||
        answer.type === ActionType.VIDEO ||
        answer.type === ActionType.PDF
      ) {
        const submittedAnswer = answersForAction[0];
        if (!submittedAnswer) {
          return false;
        }

        const submittedFileUploads = (
          submittedAnswer as typeof submittedAnswer & {
            fileUploads?: Array<{ id: string }>;
          }
        ).fileUploads;

        const submittedFileUploadIds = submittedFileUploads?.map(f => f.id).sort() ?? [];
        const currentFileUploadIds = (answer.fileUploadIds ?? []).sort();

        // 둘 다 빈 배열이면 동일하지 않음 (기존 답변 없음)
        if (submittedFileUploadIds.length === 0 && currentFileUploadIds.length === 0) {
          return false;
        }

        return (
          submittedFileUploadIds.length === currentFileUploadIds.length &&
          submittedFileUploadIds.length > 0 &&
          submittedFileUploadIds.every((id, index) => id === currentFileUploadIds[index])
        );
      }

      return false;
    },
    [],
  );

  const handleNext = useCallback(async () => {
    if (!currentAnswer) return;

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
            responseId: missionResponse?.data?.answers[0]?.responseId ?? "",
            answers: [
              {
                actionId: currentAnswer.actionId,
                type: currentAnswer.type,
                isRequired: currentAnswer.isRequired,
                ...(currentAnswer.type === "MULTIPLE_CHOICE" || currentAnswer.type === "TAG"
                  ? { selectedOptionIds: currentAnswer.selectedOptionIds }
                  : {}),
                ...(currentAnswer.type === "SCALE" || currentAnswer.type === "RATING"
                  ? { scaleValue: currentAnswer.scaleValue }
                  : {}),
                ...(currentAnswer.type === "SUBJECTIVE"
                  ? { textAnswer: currentAnswer.textAnswer }
                  : {}),
                ...(currentAnswer.type === "IMAGE" ||
                currentAnswer.type === "VIDEO" ||
                currentAnswer.type === "PDF"
                  ? { fileUploadIds: currentAnswer.fileUploadIds }
                  : {}),
              },
            ],
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
      router.push(ROUTES.MISSION(missionId));
    } else {
      goBack();
    }
  }, [isFirstStep, goBack, missionId, router]);

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
