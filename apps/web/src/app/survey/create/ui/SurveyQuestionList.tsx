import { QuestionList, QuestionListProps } from './QuestionList';

type SurveyQuestionListProps = Omit<QuestionListProps, 'title'>;

export function SurveyQuestionList({
  questions,
  isLoading,
}: SurveyQuestionListProps) {
  return (
    <QuestionList
      title={LIST_TITLE}
      questions={questions}
      showSelectControls
      hasFilterBar
      hasSearchBar
      className="h-[50vh]"
      isLoading={isLoading}
    />
  );
}

const LIST_TITLE = '설문 질문 목록';
