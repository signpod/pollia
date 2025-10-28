import { QuestionList, QuestionListProps } from './QuestionList';

type UserQuestionListProps = Omit<QuestionListProps, 'title'> & {
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
};

export function UserQuestionList({
  questions,
  onSelectQuestion,
  getIsSelected,
  onSelectAll,
  onDeselectAll,
  searchQuery,
  setSearchQuery,
  isLoading,
}: UserQuestionListProps) {
  return (
    <QuestionList
      title="사용자 질문 목록"
      questions={questions}
      onSelectQuestion={onSelectQuestion}
      getIsSelected={getIsSelected}
      onSelectAll={onSelectAll}
      onDeselectAll={onDeselectAll}
      showSelectControls={true}
      hasSearchBar
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      className="h-[35vh]"
      isLoading={isLoading}
    />
  );
}
