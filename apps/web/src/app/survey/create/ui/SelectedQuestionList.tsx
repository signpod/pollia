import { SurveyQuestionSummary } from "@/types/domain/survey";
import { QuestionList, QuestionListProps } from "./QuestionList";

interface SelectedQuestionListProps extends Omit<QuestionListProps, "title" | "isDraggable"> {
  questions: SurveyQuestionSummary[];
}

export function SelectedQuestionList({ questions }: SelectedQuestionListProps) {
  return (
    <QuestionList
      title={LIST_TITLE}
      questions={questions}
      isDraggable
      showCheckboxInDraggable
      className="h-[35vh]"
    />
  );
}

const LIST_TITLE = "선택된 질문 목록";
