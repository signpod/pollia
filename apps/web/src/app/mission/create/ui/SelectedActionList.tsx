import { ActionSummary } from "@/types/domain/action";
import { ActionList, ActionListProps } from "./ActionList";

interface SelectedActionListProps extends Omit<ActionListProps, "title" | "isDraggable"> {
  actions: ActionSummary[];
}

export function SelectedActionList({ actions }: SelectedActionListProps) {
  return (
    <ActionList
      title={LIST_TITLE}
      actions={actions}
      isDraggable
      showCheckboxInDraggable
      className="h-[35vh]"
    />
  );
}

const LIST_TITLE = "선택된 질문 목록";
