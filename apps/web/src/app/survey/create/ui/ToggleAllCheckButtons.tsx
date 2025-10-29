import {
  deselectAllQuestionsAtom,
  selectAllQuestionsAtom,
} from '@/atoms/create';
import { Button, Typo } from '@repo/ui/components';
import { useSetAtom } from 'jotai';
import { SurveyQuestionSummary } from '@/types/domain/survey';

interface ToggleAllCheckButtonsProps {
  questions: SurveyQuestionSummary[];
}

export function ToggleAllCheckButtons({
  questions,
}: ToggleAllCheckButtonsProps) {
  const selectAllQuestions = useSetAtom(selectAllQuestionsAtom);
  const deselectAllQuestions = useSetAtom(deselectAllQuestionsAtom);

  const handleSelectAll = () => {
    selectAllQuestions(questions);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        onClick={() => deselectAllQuestions()}
        className="p-2 h-auto"
      >
        <Typo.Body size="small">전체 해제</Typo.Body>
      </Button>

      <Button
        variant="ghost"
        onClick={handleSelectAll}
        className="p-2 h-auto"
      >
        <Typo.Body size="small">전체 선택</Typo.Body>
      </Button>
    </div>
  );
}
