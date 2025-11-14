"use client";

import {
  ExtendedQuestionStepConfig,
  QuestionData,
  createQuestionSteps,
} from "@/constants/surveyQuestion";
import { SurveyQuestionType } from "@/types/domain/survey";
// TODO: 임시 타입 - 답변 제출 스펙 미확정으로 추후 변경 예정
import type { SurveyAnswerItem } from "@/types/dto/survey";
import { StepProvider, useStep } from "@repo/ui/components";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { useRef, useState } from "react";
import { SurveyMultipleChoice, SurveyScale, SurveySubjective } from "./ui";

// TODO: 실제 데이터는 서버에서 fetch하여 사용
const MOCK_QUESTIONS: QuestionData[] = [
  {
    id: "cmhtuw6jp00021hatgwmh05b1",
    order: 1,
    type: SurveyQuestionType.SCALE,
    title: "[척도형 질문 예시]설문조사 제목입니다. 입니다.",
    description: "설문조사 설명입니다. 척도형 질문 예시입니다.",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
    scaleConfig: {
      min: 1,
      max: 5,
      labels: ["매우 불만족", "불만족", "보통", "만족", "매우 만족"],
    },
  },
  {
    id: "cmho7ioha000093zaw3i1sqfc",
    order: 2,
    type: SurveyQuestionType.SUBJECTIVE,
    title: "추가로 하고 싶은 말씀이 있으신가요?",
    description: "자유롭게 의견을 작성해주세요.",
  },
  {
    id: "cmho7ioha000093zaw3i1sqfd1",
    order: 3,
    type: SurveyQuestionType.MULTIPLE_CHOICE,
    title: "코카콜라 맛있다 맛있으면 또 먹어",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
    description: "척척 박사님 가르쳐주세요",
    options: [
      {
        id: "cmho7ioha000093zaw3i1sqfd2",
        label: "맛있다",
        description: "맛있다",
        imageUrl:
          "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
      },
      {
        id: "cmho7ioha000093zaw3i1sqfd3",
        label: "맛있지 않다",
        description: "맛있지 않다",
        imageUrl:
          "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
      },
      {
        id: "cmho7ioha000093zaw3i1sqfd4",
        label: "모르겠다",
        description: "모르겠다",
        imageUrl:
          "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
      },
    ],
    maxSelections: 2,
  },
  {
    id: "cmho7ioha000093zaw3i1sqfdddddAAA",
    order: 4,
    type: SurveyQuestionType.MULTIPLE_CHOICE,
    title: "코카콜라 맛있다 맛있으면 또 먹어",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
    description: "척척 박사님 가르쳐주세요",
    options: [
      {
        id: "cmho7ioha000093zaw3i1sqfddddd1",
        label: "맛있다",
        description: "맛있다",
        imageUrl:
          "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
      },
      {
        id: "cmho7ioha000093zaw3i1sqfdddddd2",
        label: "맛있지 않다",
        description: "맛있지 않다",
        imageUrl:
          "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
      },
      {
        id: "cmho7ioha000093zaw3i1sqfdddddd3",
        label: "모르겠다",
        description: "모르겠다",
        imageUrl:
          "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
      },
    ],
    maxSelections: 1,
  },
];

export default function SurveyPage() {
  const steps = createQuestionSteps({
    questions: MOCK_QUESTIONS,
    stepComponents: {
      MultipleChoice: SurveyMultipleChoice,
      Scale: SurveyScale,
      Subjective: SurveySubjective,
    },
  });

  return (
    <StepProvider steps={steps} initialStep={0} syncWithUrl>
      <SurveyQuestionRenderer />
    </StepProvider>
  );
}

function SurveyQuestionRenderer() {
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
      totalQuestionCount={MOCK_QUESTIONS.length}
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
