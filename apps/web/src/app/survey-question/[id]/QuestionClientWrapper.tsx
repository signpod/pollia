"use client";
import { toast } from "@/components/common/Toast";
import { ROUTES } from "@/constants/routes";
import { SURVEY_TOAST_MESSAGE } from "@/constants/surveyMessages";
import { ExtendedQuestionStepConfig, createQuestionSteps } from "@/constants/surveyQuestion";
import { useReadSurveyQuestionsDetail } from "@/hooks/survey/question/useReadSurveyQuestionsDetail";
import type { SurveyAnswerItem } from "@/types/dto";
import { StepProvider, useModal, useStep } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useRef, useState } from "react";
import { SurveyMultipleChoice, SurveyScale, SurveySubjective } from "../ui";

const SURVEY_EXIT_MODAL = {
  title: "설문을 종료하실 건가요?",
  description: "이 페이지를 벗어나면 저장된 내용이 사라져요.",
  confirmText: "계속하기",
  cancelText: "종료하기",
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
  const { data: questions } = useReadSurveyQuestionsDetail(surveyId ?? "");
  const router = useRouter();

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
    <StepProvider
      steps={steps}
      initialStep={initialStep >= 0 ? initialStep : 0}
      onStepChange={currentStepIndex => {
        const newQuestionId = (steps[currentStepIndex] as ExtendedQuestionStepConfig)?.questionData
          .id;
        if (newQuestionId && newQuestionId !== currentQuestionId) {
          router.push(ROUTES.SURVEY_QUESTION(newQuestionId));
        }
      }}
    >
      <SurveyQuestionRenderer totalQuestionCount={questions.data.length} surveyId={surveyId} />
    </StepProvider>
  );
}

function SurveyQuestionRenderer({
  totalQuestionCount,
  surveyId,
}: { totalQuestionCount: number; surveyId: string }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showModal, close } = useModal();

  const answersRef = useRef<Map<string, SurveyAnswerItem>>(new Map());
  const hasShownToastsRef = useRef({
    first: false,
    half: false,
    final: false,
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

  const updateCanGoNext = useCallback(
    (canGoNext: boolean) => {
      updateStepConfig(currentStep, { canGoNext });
    },
    [currentStep, updateStepConfig],
  );

  const handleAnswerChange = useCallback((answer: SurveyAnswerItem) => {
    answersRef.current.set(answer.questionId, answer);
  }, []);

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const answers = Array.from(answersRef.current.values());

      console.log("=".repeat(50));
      console.log("📝 설문조사 제출");
      console.log("=".repeat(50));
      console.log("설문조사 ID:", params.id);
      console.log("답변 개수:", answers.length);
      console.log("\n답변 상세:");
      answers.forEach((answer, index) => {
        console.log(`\n[${index + 1}] 질문 ID: ${answer.questionId}`);
        console.log(`   타입: ${answer.type}`);
        if (answer.type === "SCALE") {
          console.log(`   척도 값: ${answer.scaleValue}`);
        } else if (answer.type === "SUBJECTIVE") {
          console.log(`   텍스트 답변: "${answer.textResponse}"`);
        } else if (answer.type === "MULTIPLE_CHOICE") {
          console.log(`   선택한 옵션 IDs: [${answer.selectedOptionIds.join(", ")}]`);
        }
      });
      console.log(`\n${"=".repeat(50)}`);

      // TODO: 실제 API 호출로 교체 예정
      // await submitSurveyAnswers({ surveyId: params.id, answers });

      setTimeout(() => {
        setIsSubmitting(false);
        router.push(ROUTES.SURVEY_DONE(surveyId));
      }, 500);
    } catch (error) {
      console.error("설문 제출 중 오류 발생:", error);
      toast.warning(SURVEY_TOAST_MESSAGE.error.message, { id: SURVEY_TOAST_MESSAGE.error.id });
      setIsSubmitting(false);
    }
  }, [isSubmitting, params.id]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleSubmit();
    } else {
      goNext();
    }
  }, [isLastStep, goNext, handleSubmit]);

  const showExitConfirmModal = useCallback(() => {
    showModal({
      ...SURVEY_EXIT_MODAL,
      showCancelButton: true,
      onConfirm: () => {
        close();
      },
      onCancel: () => {
        router.push(ROUTES.SURVEY(surveyId));
      },
    });
  }, []);

  const handlePrevious = useCallback(() => {
    if (isFirstStep) {
      showExitConfirmModal();
    } else {
      goBack();
    }
  }, []);

  useEffect(() => {
    const currentPathRef = { current: window.location.pathname + window.location.search };

    const handlePopState = () => {
      if (window.location.pathname === ROUTES.SURVEY(surveyId)) {
        window.history.pushState(null, "", currentPathRef.current);
        showExitConfirmModal();
      } else {
        currentPathRef.current = window.location.pathname + window.location.search;
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <ContentComponent
      key={questionData.id}
      questionData={questionData}
      currentOrder={questionData.order}
      totalQuestionCount={totalQuestionCount}
      isFirstQuestion={isFirstStep}
      isNextDisabled={!canGoNext || isSubmitting}
      onPrevious={handlePrevious}
      onNext={handleNext}
      nextButtonText={isLastStep ? (isSubmitting ? "제출 중..." : "완료") : "다음"}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={handleAnswerChange}
      hasShownToastsRef={hasShownToastsRef}
    />
  );
}
