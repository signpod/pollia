"use client";

import { surveyTypeAtom } from "@/atoms/survey/create/surveyTypeAtoms";
import { CREATE_SURVEY_STEPS, createStepConfigs } from "@/constants/createSurvey";
import {
  FixedBottomLayout,
  FixedTopLayout,
  IconButton,
  StepProvider,
  Typo,
  useStep,
} from "@repo/ui/components";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { EitherOrInfoStep } from "./components/steps/EitherOrInfoStep";
import { MultipleChoiceInfoStep } from "./components/steps/MultipleChoiceInfoStep";
import { ScaleInfoStep } from "./components/steps/ScaleInfoStep";
import { SubjectiveInfoStep } from "./components/steps/SubjectiveInfoStep";
import { TypeStep } from "./components/steps/TypeStep";

export default function CreateSurveyQuestionPage() {
  return (
    <FixedBottomLayout>
      <StepProvider steps={CREATE_SURVEY_STEPS} initialStep={0}>
        <CreateSurveyQuestionPageContent />
      </StepProvider>
    </FixedBottomLayout>
  );
}

function CreateSurveyQuestionPageContent() {
  const router = useRouter();
  const surveyType = useAtomValue(surveyTypeAtom);
  const { currentStep, goBack } = useStep();

  const currentStepConfig = createStepConfigs({
    router,
    goBack,
    stepType: surveyType ?? "ChoiceType",
    stepComponents: {
      TypeStep,
      EitherOrInfoStep,
      MultipleChoiceInfoStep,
      ScaleInfoStep,
      SubjectiveInfoStep,
    },
  })[currentStep];

  return (
    <FixedTopLayout className="flex h-full flex-col bg-white">
      <FixedTopLayout.Content className="flex flex-col gap-4">
        <div className="px-1">
          {currentStepConfig?.header.icon && (
            <IconButton
              onClick={currentStepConfig.header.action}
              icon={currentStepConfig.header.icon}
              className="size-12"
            >
              <span className="sr-only">뒤로가기</span>
            </IconButton>
          )}
        </div>
      </FixedTopLayout.Content>

      <div className="space-y-1 px-5">
        <Typo.MainTitle size="medium">{currentStepConfig?.title}</Typo.MainTitle>
        {currentStepConfig?.description && (
          <Typo.Body size="large" className="text-zinc-600">
            {currentStepConfig.description}
          </Typo.Body>
        )}
      </div>

      <div className="py-6">{currentStepConfig?.content()}</div>
    </FixedTopLayout>
  );
}
