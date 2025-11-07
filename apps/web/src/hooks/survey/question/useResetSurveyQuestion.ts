import { resetEitherOrAtom } from "@/atoms/survey/question/eitherOrInfoAtoms";
import { resetMultipleChoiceAtom } from "@/atoms/survey/question/multipleChoiceInfoAtoms";
import { resetScaleAtom } from "@/atoms/survey/question/scaleInfoAtoms";
import { resetSubjectiveAtom } from "@/atoms/survey/question/subjectiveInfoAtoms";
import { surveyQuestionTypeAtom } from "@/atoms/survey/question/surveyTypeAtoms";
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
