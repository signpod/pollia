"use client";

import {
  selectedQuestionAtom,
  selectedQuestionCountAtom,
  surveyTitleAtom,
  surveyValidationAtom,
} from "@/atoms/create/surveyAtoms";
import { useCreateSurvey } from "@/hooks/survey/useCreateSurvey";
import { Button, toast } from "@repo/ui/components";
import { useAtomValue } from "jotai";

const CREATE_SURVEY_MESSAGE = {
  SUCCESS: "설문조사지 생성에 성공했습니다.",
  ERROR: "설문조사지 생성에 실패했습니다.",
};

export function CreateSurveyButton() {
  const surveyTitle = useAtomValue(surveyTitleAtom);
  const selectedQuestions = useAtomValue(selectedQuestionAtom);
  const validation = useAtomValue(surveyValidationAtom);
  const selectedQuestionCount = useAtomValue(selectedQuestionCountAtom);

  const { mutate, isPending } = useCreateSurvey({
    onSuccess: () => {
      toast.success(CREATE_SURVEY_MESSAGE.SUCCESS);
    },
    onError: () => {
      toast.error(CREATE_SURVEY_MESSAGE.ERROR);
    },
  });

  const handleCreateSurvey = () => {
    mutate({
      title: surveyTitle,
      questionIds: Array.from(selectedQuestions).map(question => question.id),
    });
  };

  return (
    <Button
      variant="primary"
      className="w-full"
      loading={isPending}
      onClick={handleCreateSurvey}
      disabled={!validation.isValid || selectedQuestionCount === 0}
    >
      설문지 생성
    </Button>
  );
}
