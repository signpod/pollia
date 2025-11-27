"use client";
import {
  CreateSurveyButton,
  SelectedQuestionDataContainer,
  SelectedQuestionList,
  SurveyDateAndTimeForm,
  SurveyDescriptionForm,
  SurveyEstimatedMinutesForm,
  SurveyQuestionDataContainer,
  SurveyQuestionList,
  SurveyTargetForm,
  SurveyTitleForm,
} from "@/app/survey/create/ui";
import { selectedQuestionCountAtom } from "@/atoms/survey/surveyAtoms";
import { FixedBottomLayout, FixedTopLayout, Typo } from "@repo/ui/components";
import { useAtomValue } from "jotai";

export function CreateSurveyContent() {
  const selectedQuestionCount = useAtomValue(selectedQuestionCountAtom);

  return (
    <FixedBottomLayout className="flex flex-col px-5">
      <FixedTopLayout>
        <FixedTopLayout.Content className="flex w-full items-center justify-between py-4">
          <Typo.MainTitle size="medium">설문조사 생성</Typo.MainTitle>
          <div className="flex items-center gap-1">
            <Typo.Body size="large" className="font-bold text-violet-500">
              {selectedQuestionCount}
            </Typo.Body>
            <Typo.Body size="small">개 선택</Typo.Body>
          </div>
        </FixedTopLayout.Content>
      </FixedTopLayout>

      <div className="flex h-full flex-col gap-8 py-4">
        <SurveyTitleForm />
        <SurveyDescriptionForm />
        <SurveyTargetForm />
        <SurveyQuestionDataContainer>
          {({ questions, isLoading }) => (
            <SurveyQuestionList isLoading={isLoading} questions={questions} />
          )}
        </SurveyQuestionDataContainer>

        <SelectedQuestionDataContainer>
          {({ questions }) => <SelectedQuestionList questions={questions} />}
        </SelectedQuestionDataContainer>

        <SurveyDateAndTimeForm />

        <SurveyEstimatedMinutesForm />
      </div>

      <FixedBottomLayout.Content className="p-5">
        <CreateSurveyButton />
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}
