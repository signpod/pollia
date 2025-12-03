"use client";
import { toast } from "@/components/common/Toast";
import { ROUTES } from "@/constants/routes";
import { SURVEY_TOAST_MESSAGE } from "@/constants/surveyMessages";
import { ExtendedQuestionStepConfig, createQuestionSteps } from "@/constants/surveyQuestion";
import { usePreventBack } from "@/hooks/common/usePreventBack";
import {
  useReadSurveyResponseForSurvey,
  useStartSurveyResponse,
  useSubmitQuestionAnswer,
  useSubmitSurveyAnswers,
} from "@/hooks/survey-response";
import { useReadSurveyQuestionsDetail } from "@/hooks/survey/question/useReadSurveyQuestionsDetail";
import {
  getSessionStorageJSON,
  removeSessionStorage,
  setSessionStorageJSON,
} from "@/lib/sessionStorage";
import type { SurveyAnswerItem } from "@/types/dto";
import { StepProvider, useModal, useStep } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SurveyMultipleChoice, SurveyScale, SurveySubjective } from "../ui";

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

interface QuestionClientWrapperProps {
  surveyId: string;
  dehydratedState: DehydratedState;
  currentQuestionId: string;
}

export function QuestionClientWrapper({
  surveyId,
  dehydratedState,
  currentQuestionId,
}: QuestionClientWrapperProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <SurveyQuestionContent surveyId={surveyId} currentQuestionId={currentQuestionId} />
    </HydrationBoundary>
  );
}

function SurveyQuestionContent({
  surveyId,
  currentQuestionId,
}: { surveyId: string; currentQuestionId: string }) {
  const { data: questions } = useReadSurveyQuestionsDetail(surveyId);

  const steps = createQuestionSteps({
    questions: questions.data,
    stepComponents: {
      MultipleChoice: SurveyMultipleChoice,
      Scale: SurveyScale,
      Subjective: SurveySubjective,
    },
  });

  const initialStep = steps.findIndex(
    step => (step as ExtendedQuestionStepConfig).questionData.id === currentQuestionId,
  );

  return (
    <StepProvider syncWithUrl steps={steps} initialStep={initialStep >= 0 ? initialStep : 0}>
      <SurveyQuestionRenderer totalQuestionCount={questions.data.length} surveyId={surveyId} />
    </StepProvider>
  );
}

function SurveyQuestionRenderer({
  totalQuestionCount,
  surveyId,
}: {
  totalQuestionCount: number;
  surveyId: string;
}) {
  const router = useRouter();
  const [responseId, setResponseId] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<SurveyAnswerItem | null>(null);
  const { showModal, close } = useModal();

  const { data: surveyResponse } = useReadSurveyResponseForSurvey({
    surveyId,
  });

  const isExitingRef = useRef(false);
  const toastStorageKey = `survey-toast-${surveyId}`;

  const { mutate: startResponse, isPending: isStarting } = useStartSurveyResponse({
    onSuccess: data => {
      setResponseId(data.data.id);
    },
    onError: () => {
      toast.warning("설문 응답을 시작할 수 없습니다.", { id: "init-error" });
      router.push(ROUTES.SURVEY(surveyId));
    },
  });

  const { mutate: submitAnswer, isPending: isSubmittingAnswer } = useSubmitQuestionAnswer({
    onSuccess: () => {
      goNext();
    },
    onError: () => {
      toast.warning("답변 저장에 실패했습니다.", { id: "submit-answer-error" });
    },
  });

  const { mutateAsync: completeSurveyAsync } = useSubmitSurveyAnswers({
    onSuccess: () => {
      removeSessionStorage(toastStorageKey);
      router.push(ROUTES.SURVEY_DONE(surveyId));
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
  } = useStep();

  const stepConfig = currentStepConfig as unknown as ExtendedQuestionStepConfig;
  const ContentComponent = stepConfig.content;
  const questionData = stepConfig.questionData;

  const lastToastQuestionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastToastQuestionIdRef.current === questionData.id) {
      return;
    }

    lastToastQuestionIdRef.current = questionData.id;

    const currentOrder = questionData.order;
    const progressValue = (currentOrder / totalQuestionCount) * 100 || 0;

    const isFirstQuestion = currentOrder === 1;
    const isFinalQuestion = currentOrder === totalQuestionCount && totalQuestionCount > 1;
    const isHalfway = progressValue >= 50 && totalQuestionCount > 2;

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
  }, [questionData.id, questionData.order, totalQuestionCount, toastStorageKey]);

  const updateCanGoNext = useCallback(
    (canGoNext: boolean) => {
      updateStepConfig(currentStep, { canGoNext });
    },
    [currentStep, updateStepConfig],
  );

  const handleAnswerChange = useCallback((answer: SurveyAnswerItem) => {
    setCurrentAnswer(answer);
  }, []);

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startResponse({ surveyId });
    }
  }, [surveyId, startResponse]);

  const handleNext = useCallback(() => {
    if (!responseId || !currentAnswer) return;

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
          router.push(ROUTES.SURVEY(surveyId));
        }, 100);
      },
    });
  }, [surveyId, showModal, close, router]);

  const handlePrevious = useCallback(() => {
    if (isFirstStep) {
      showExitConfirmModal();
    } else {
      goBack();
    }
  }, [isFirstStep, goBack, showExitConfirmModal]);

  usePreventBack({
    onPopState: () => {
      if (isExitingRef.current) {
        return;
      }
      if (isFirstStep) {
        showExitConfirmModal();
      } else {
        goBack();
      }
    },
    checkState: state => state?.fromSurveyQuestion === true,
  });

  const isInitializing = isStarting || !responseId;

  return (
    <ContentComponent
      key={questionData.id}
      questionData={questionData}
      currentOrder={questionData.order}
      totalQuestionCount={totalQuestionCount}
      isFirstQuestion={isFirstStep}
      isNextDisabled={!canGoNext || isSubmittingAnswer || isInitializing}
      onPrevious={handlePrevious}
      onNext={handleNext}
      nextButtonText={isLastStep ? "제출하기" : "다음"}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={handleAnswerChange}
      surveyResponse={surveyResponse?.data ? surveyResponse : undefined}
    />
  );
}
