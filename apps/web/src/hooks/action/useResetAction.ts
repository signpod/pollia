import { resetMultipleChoiceAtom } from "@/atoms/action/creation/multipleChoice";
import { resetScaleAtom } from "@/atoms/action/creation/scaleAtoms";
import { resetSubjectiveAtom } from "@/atoms/action/creation/subjectiveAtoms";
import { actionTypeAtom } from "@/atoms/action/missionTypeAtoms";
import { useSetAtom } from "jotai";

export function useResetAction() {
  const setActionType = useSetAtom(actionTypeAtom);
  const resetMultipleChoice = useSetAtom(resetMultipleChoiceAtom);
  const resetScale = useSetAtom(resetScaleAtom);
  const resetSubjective = useSetAtom(resetSubjectiveAtom);

  const handleResetAction = () => {
    setActionType(null);
    resetMultipleChoice();
    resetScale();
    resetSubjective();
  };

  return {
    handleResetAction,
  };
}
