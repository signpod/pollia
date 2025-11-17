"use client";

import { ExtendedQuestionStepConfig, createQuestionSteps } from "@/constants/surveyQuestion";
import { useReadSurveyQuestionsDetail } from "@/hooks/survey/question/useReadSurveyQuestionsDetail";
import type { SurveyAnswerItem } from "@/types/dto";
import { StepProvider, useStep } from "@repo/ui/components";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { useRef, useState } from "react";
import { SurveyMultipleChoice, SurveyScale, SurveySubjective } from "./ui";

export default function SurveyPage() {
  const params = useParams<{ id: string }>();
  const { data: questions } = useReadSurveyQuestionsDetail(params.id);

  const steps = createQuestionSteps({
    questions: questions?.data ?? [],
    stepComponents: {
      MultipleChoice: SurveyMultipleChoice,
      Scale: SurveyScale,
      Subjective: SurveySubjective,
    },
  });

  return (
    <StepProvider steps={steps} initialStep={0} syncWithUrl>
      <SurveyQuestionRenderer totalQuestionCount={questions?.data?.length ?? 0} />
    </StepProvider>
  );
}

function SurveyQuestionRenderer({ totalQuestionCount }: { totalQuestionCount: number }) {
  const params = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const answersRef = useRef<Map<string, SurveyAnswerItem>>(new Map());

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

    setTimeout(() => {
      setIsSubmitting(false);
      alert("답변이 수집되었습니다! (콘솔을 확인하세요)");
      // TODO: 임시 - 완료 후 동작 미확정 (페이지 이동 or 모달 표시 등)
      // router.push(`/survey/${params.id}/done`);
    }, 500);
  }, [isSubmitting, params.id]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleSubmit();
    } else {
      goNext();
    }
  }, [isLastStep, goNext, handleSubmit]);

  return (
    <ContentComponent
      key={questionData.id}
      questionData={questionData}
      currentOrder={questionData.order}
      totalQuestionCount={totalQuestionCount}
      isFirstQuestion={isFirstStep}
      isNextDisabled={!canGoNext || isSubmitting}
      onPrevious={goBack}
      onNext={handleNext}
      nextButtonText={isLastStep ? (isSubmitting ? "제출 중..." : "완료") : "다음"}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={handleAnswerChange}
    />
  );
}
