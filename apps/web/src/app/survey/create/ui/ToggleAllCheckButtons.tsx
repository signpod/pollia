import {
  deselectAllQuestionsAtom,
  selectAllQuestionsAtom,
  selectedQuestionAtom,
} from "@/atoms/survey/surveyAtoms";
import { SurveyQuestionSummary } from "@/types/domain/survey";
import { Button, Typo } from "@repo/ui/components";
import { useAtomValue, useSetAtom } from "jotai";

interface ToggleAllCheckButtonsProps {
  questions: SurveyQuestionSummary[];
}

export function ToggleAllCheckButtons({ questions }: ToggleAllCheckButtonsProps) {
  const { handleSelectAll, handleDeselectAll, isAllSelected, isAllDeselected } =
    useToggleAllCheckButtons({ questions });

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

function useToggleAllCheckButtons({ questions }: ToggleAllCheckButtonsProps) {
  const selectAllQuestions = useSetAtom(selectAllQuestionsAtom);
  const deselectAllQuestions = useSetAtom(deselectAllQuestionsAtom);
  const selectedQuestions = useAtomValue(selectedQuestionAtom);

  const handleSelectAll = () => {
    selectAllQuestions(questions);
  };

  const handleDeselectAll = () => {
    deselectAllQuestions();
  };

  const isAllSelected = questions.every(question =>
    selectedQuestions.some(q => q.id === question.id),
  );
  const isAllDeselected = questions.every(
    question => !selectedQuestions.some(q => q.id === question.id),
  );

  return {
    handleSelectAll,
    handleDeselectAll,
    isAllSelected,
    isAllDeselected,
  };
}
