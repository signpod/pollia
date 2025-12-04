import { ActionList, ActionListProps } from "./ActionList";

type SurveyQuestionListProps = Omit<ActionListProps, "title">;

export function SurveyQuestionList({ actions, isLoading }: SurveyQuestionListProps) {
  return (
    <ActionList
      title={LIST_TITLE}
      actions={actions}
      showSelectControls
      hasFilterBar
      hasSearchBar
      className="h-[50vh]"
      isLoading={isLoading}
    />
  );
}

const LIST_TITLE = "설문 질문 목록";
