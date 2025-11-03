import { eitherOrTitleAtom } from "@/atoms/survey/create/eitherOrInfoAtoms";
import {
  multipleChoiceTitleAtom,
  resetMultipleChoiceOptionsAtom,
} from "@/atoms/survey/create/multipleChoiceInfoAtoms";
import { scaleTitleAtom } from "@/atoms/survey/create/scaleInfoAtoms";
import { subjectiveTitleAtom } from "@/atoms/survey/create/subjectiveInfoAtoms";
import { surveyQuestionTypeAtom } from "@/atoms/survey/create/surveyTypeAtoms";
import { useSetAtom } from "jotai";

export function useResetSurveyQuestion() {
  const setSurveyQuestionType = useSetAtom(surveyQuestionTypeAtom);
  const setMultipleChoiceInfo = useSetAtom(multipleChoiceTitleAtom);
  const setScaleInfo = useSetAtom(scaleTitleAtom);
  const setSubjectiveInfo = useSetAtom(subjectiveTitleAtom);
  const setEitherOrInfo = useSetAtom(eitherOrTitleAtom);
  const resetMultipleChoiceOptions = useSetAtom(resetMultipleChoiceOptionsAtom);

  const handleResetSurveyQuestion = () => {
    setSurveyQuestionType(null);
    setMultipleChoiceInfo("");
    setScaleInfo("");
    setSubjectiveInfo("");
    setEitherOrInfo("");
    resetMultipleChoiceOptions();
  };

  return {
    handleResetSurveyQuestion,
  };
}
