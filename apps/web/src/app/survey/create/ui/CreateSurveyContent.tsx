'use client';

import { FixedBottomLayout, FixedTopLayout, Typo } from '@repo/ui/components';
import { useAtomValue } from 'jotai';
import { selectedQuestionCountAtom } from '@/atoms/create/surveyAtoms';
import {
  SurveyTitleForm,
  SurveyQuestionDataContainer,
  SelectedQuestionDataContainer,
  SurveyQuestionList,
  SelectedQuestionList,
  CreateSurveyButton,
} from '@/app/survey/create/ui';

export function CreateSurveyContent() {
  const selectedQuestionCount = useAtomValue(selectedQuestionCountAtom);

  return (
    <FixedBottomLayout className="flex flex-col">
      <FixedTopLayout>
        <FixedTopLayout.Content className="py-4 flex items-center justify-between  w-full">
          <Typo.MainTitle size="medium">설문조사지 생성</Typo.MainTitle>
          <div className="flex items-center gap-1">
            <Typo.Body size="large" className="text-violet-500 font-bold">
              {selectedQuestionCount}
            </Typo.Body>
            <Typo.Body size="small">개 선택</Typo.Body>
          </div>
        </FixedTopLayout.Content>
      </FixedTopLayout>

      <div className="flex flex-col gap-8  h-full py-4">
        <SurveyTitleForm />
        <SurveyQuestionDataContainer>
          {({ questions, isLoading }) => (
            <SurveyQuestionList isLoading={isLoading} questions={questions} />
          )}
        </SurveyQuestionDataContainer>

        <SelectedQuestionDataContainer>
          {({ questions }) => <SelectedQuestionList questions={questions} />}
        </SelectedQuestionDataContainer>
      </div>

      <FixedBottomLayout.Content className="p-5">
        <CreateSurveyButton />
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}
