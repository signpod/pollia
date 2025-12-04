import {
  deselectAllActionsAtom,
  selectAllActionsAtom,
  selectedActionAtom,
} from "@/atoms/mission/missionAtoms";
import { ActionSummary } from "@/types/domain/action";
import { Button, Typo } from "@repo/ui/components";
import { useAtomValue, useSetAtom } from "jotai";

interface ToggleAllCheckButtonsProps {
  actions: ActionSummary[];
}

export function ToggleAllCheckButtons({ actions }: ToggleAllCheckButtonsProps) {
  const { handleSelectAll, handleDeselectAll, isAllSelected, isAllDeselected } =
    useToggleAllCheckButtons({ actions });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        onClick={handleDeselectAll}
        className="h-auto p-2"
        disabled={isAllDeselected}
      >
        <Typo.Body size="small">전체 해제</Typo.Body>
      </Button>

      <Button
        variant="ghost"
        onClick={handleSelectAll}
        className="h-auto p-2"
        disabled={isAllSelected}
      >
        <Typo.Body size="small">전체 선택</Typo.Body>
      </Button>
    </div>
  );
}

function useToggleAllCheckButtons({ actions }: ToggleAllCheckButtonsProps) {
  const selectAllQuestions = useSetAtom(selectAllActionsAtom);
  const deselectAllQuestions = useSetAtom(deselectAllActionsAtom);
  const selectedQuestions = useAtomValue(selectedActionAtom);

  const handleSelectAll = () => {
    selectAllQuestions(actions);
  };

  const handleDeselectAll = () => {
    deselectAllQuestions();
  };

  const isAllSelected = actions.every(action => selectedQuestions.some(q => q.id === action.id));
  const isAllDeselected = actions.every(action => !selectedQuestions.some(q => q.id === action.id));

  return {
    handleSelectAll,
    handleDeselectAll,
    isAllSelected,
    isAllDeselected,
  };
}
