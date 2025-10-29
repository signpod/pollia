'use client';

import { FixedBottomLayout, FixedTopLayout, Typo } from '@repo/ui/components';
import { useMemo } from 'react';
import { UserQuestionList } from './UserQuestionList';
import { SelectedQuestionList } from './SelectedQuestionList';
import { SurveyQuestionType } from '@prisma/client';
import { SurveyTitleForm } from './SurveyTitleForm';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  searchQueryAtom,
  selectedQuestionIdsAtom,
  selectedQuestionCountAtom,
  toggleQuestionAtom,
  selectAllQuestionsAtom,
  deselectAllQuestionsAtom,
  reorderQuestionsAtom,
  selectedQuestionTypesAtom,
} from '@/atoms/create/surveyAtoms';
import { useReadSurveyQuestions } from '@/hooks/survey/question/useReadSurveyQuestions';
import { CreateSurveyButton } from './CreateSurveyButton';

export function CreateSurveyContent() {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const selectedQuestionIds = useAtomValue(selectedQuestionIdsAtom);
  const selectedQuestionCount = useAtomValue(selectedQuestionCountAtom);
  const toggleQuestion = useSetAtom(toggleQuestionAtom);
  const selectAllQuestions = useSetAtom(selectAllQuestionsAtom);
  const deselectAllQuestions = useSetAtom(deselectAllQuestionsAtom);
  const reorderQuestions = useSetAtom(reorderQuestionsAtom);
  const selectedQuestionTypes = useAtomValue(selectedQuestionTypesAtom);

  const { data: questions, isLoading } = useReadSurveyQuestions();

  const filteredQuestions = useMemo(() => {
    if (selectedQuestionTypes?.size === 0) {
      return questions;
    }
    return questions?.filter((question) =>
      selectedQuestionTypes?.has(question.type)
    );
  }, [questions, selectedQuestionTypes]);

  const selectedQuestions = useMemo(() => {
    return selectedQuestionIds
      .map((questionId) =>
        questions?.find((question) => question.id === questionId)
      )
      .filter((question): question is NonNullable<typeof question> =>
        Boolean(question)
      );
  }, [selectedQuestionIds, questions]);

  const handleSelectQuestion = (questionId: string) => {
    toggleQuestion(questionId);
  };

  const handleReorder = (
    newOrder: { id: string; title: string; type: SurveyQuestionType }[]
  ) => {
    reorderQuestions(newOrder.map((q) => q.id));
  };

  const handleSelectAll = () => {
    if (questions) {
      selectAllQuestions(questions.map((q) => q.id));
    }
  };

  const handleDeselectAll = () => {
    deselectAllQuestions();
  };

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
        <UserQuestionList
          isLoading={isLoading ?? false}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          questions={
            filteredQuestions?.map((question) => ({
              id: question.id,
              title: question.title,
              type: question.type,
            })) ?? []
          }
          onSelectQuestion={handleSelectQuestion}
          getIsSelected={(questionId) =>
            selectedQuestionIds.includes(questionId)
          }
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
        />
        <SelectedQuestionList
          // FIXME: as 없애기
          questions={
            selectedQuestions as {
              id: string;
              title: string;
              type: SurveyQuestionType;
            }[]
          }
          onSelectQuestion={handleSelectQuestion}
          getIsSelected={(questionId) =>
            selectedQuestionIds.includes(questionId)
          }
          onReorder={handleReorder}
          onDeselectAll={handleDeselectAll}
        />
      </div>

      <FixedBottomLayout.Content className="p-5">
        <CreateSurveyButton />
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}
