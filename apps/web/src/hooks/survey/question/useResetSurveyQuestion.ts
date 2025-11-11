import { resetMultipleChoiceAtom } from "@/atoms/survey/question/creation/multipleChoiceInfoAtoms";
import { resetScaleAtom } from "@/atoms/survey/question/creation/scaleAtoms";
import { resetSubjectiveAtom } from "@/atoms/survey/question/creation/subjectiveAtoms";
import { surveyQuestionTypeAtom } from "@/atoms/survey/question/surveyTypeAtoms";
import { useSetAtom } from "jotai";

export function useResetSurveyQuestion() {
  const setSurveyQuestionType = useSetAtom(surveyQuestionTypeAtom);
  const resetMultipleChoice = useSetAtom(resetMultipleChoiceAtom);
  const resetScale = useSetAtom(resetScaleAtom);
  const resetSubjective = useSetAtom(resetSubjectiveAtom);

  const handleResetSurveyQuestion = () => {
    setSurveyQuestionType(null);
    resetMultipleChoice();
    resetScale();
    resetSubjective();
  };

  return {
    handleResetSurveyQuestion,
  };
}
