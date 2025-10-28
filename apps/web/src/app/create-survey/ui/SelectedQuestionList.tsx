import { PollType } from '@prisma/client';
import { QuestionList, QuestionListProps } from './QuestionList';

interface SelectedQuestionListProps
  extends Omit<QuestionListProps, 'title' | 'isDraggable'> {
  questions: {
    id: string;
    title: string;
    type: PollType;
  }[];
}

export function SelectedQuestionList({
  questions,
  onSelectQuestion,
  onReorder,
  onDeselectAll,
  getIsSelected,
}: SelectedQuestionListProps) {
  return (
    <QuestionList
      title="선택된 질문 목록"
      questions={questions}
      onSelectQuestion={onSelectQuestion}
      getIsSelected={getIsSelected}
      onReorder={onReorder}
      onDeselectAll={onDeselectAll}
      isDraggable
      showCheckboxInDraggable
      className=" h-[35vh]"
    />
  );
}
