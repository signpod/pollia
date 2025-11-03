import { resetEitherOrAtom } from "@/atoms/survey/create/eitherOrInfoAtoms";
import { resetMultipleChoiceAtom } from "@/atoms/survey/create/multipleChoiceInfoAtoms";
import { resetScaleAtom } from "@/atoms/survey/create/scaleInfoAtoms";
import { resetSubjectiveAtom } from "@/atoms/survey/create/subjectiveInfoAtoms";
import { surveyQuestionTypeAtom } from "@/atoms/survey/create/surveyTypeAtoms";
import { useSetAtom } from "jotai";

export function useResetSurveyQuestion() {
  const setSurveyQuestionType = useSetAtom(surveyQuestionTypeAtom);
  const resetMultipleChoice = useSetAtom(resetMultipleChoiceAtom);
  const resetScale = useSetAtom(resetScaleAtom);
  const resetSubjective = useSetAtom(resetSubjectiveAtom);
  const resetEitherOr = useSetAtom(resetEitherOrAtom);

  const handleResetSurveyQuestion = () => {
    setSurveyQuestionType(null);
    resetMultipleChoice();
    resetScale();
    resetSubjective();
    resetEitherOr();
  };

  return {
    handleResetSurveyQuestion,
  };
}
