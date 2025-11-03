import { resetEitherOrAtom } from "@/atoms/survey/quetion/eitherOrInfoAtoms";
import { resetMultipleChoiceAtom } from "@/atoms/survey/quetion/multipleChoiceInfoAtoms";
import { resetScaleAtom } from "@/atoms/survey/quetion/scaleInfoAtoms";
import { resetSubjectiveAtom } from "@/atoms/survey/quetion/subjectiveInfoAtoms";
import { surveyQuestionTypeAtom } from "@/atoms/survey/quetion/surveyTypeAtoms";
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
