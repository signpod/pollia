'use client';

import {
  Button,
  FixedBottomLayout,
  FixedTopLayout,
  Typo,
} from '@repo/ui/components';
import { useMemo } from 'react';
import { useUserPolls } from '@/hooks/poll/usePoll';
import { UserQuestionList } from './UserQuestionList';
import { SelectedQuestionList } from './SelectedQuestionList';
import { PollType } from '@prisma/client';
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
  surveyValidationAtom,
} from '@/atoms/create/surveyAtoms';

export function CreateSurveyContent() {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const selectedQuestionIds = useAtomValue(selectedQuestionIdsAtom);
  const selectedQuestionCount = useAtomValue(selectedQuestionCountAtom);
  const validation = useAtomValue(surveyValidationAtom);
  const toggleQuestion = useSetAtom(toggleQuestionAtom);
  const selectAllQuestions = useSetAtom(selectAllQuestionsAtom);
  const deselectAllQuestions = useSetAtom(deselectAllQuestionsAtom);
  const reorderQuestions = useSetAtom(reorderQuestionsAtom);

  const { data: questions, isLoading } = useUserPolls({ searchQuery });

  const selectedQuestions = useMemo(() => {
    return (
      selectedQuestionIds
        .map((questionId) =>
          questions?.find((question) => question.id === questionId)
        )
        .filter(Boolean) ?? []
    );
  }, [selectedQuestionIds, questions]);

  const handleSelectQuestion = (questionId: string) => {
    toggleQuestion(questionId);
  };

  const handleReorder = (
    newOrder: { id: string; title: string; type: PollType }[]
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

  const handleCreateSurvey = () => {
    // TODO: 설문조사지 생성 로직 구현
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
            questions?.map((question) => ({
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
              type: PollType;
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
        <Button
          variant="primary"
          className="w-full"
          onClick={handleCreateSurvey}
          disabled={!validation.isValid || selectedQuestionCount === 0}
        >
          설문지 생성
        </Button>
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}
