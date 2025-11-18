"use client";

import {
  resetSurveyAtom,
  selectedQuestionAtom,
  surveyDeadlineDateAtom,
  surveyDeadlineTimeAtom,
  surveyDescriptionAtom,
  surveyTargetAtom,
  surveyTitleAtom,
  surveyValidationAtom,
} from "@/atoms/survey/surveyAtoms";
import { toast } from "@/components/common/Toast";
import { usePushAfter } from "@/hooks/common/usePushAfter";
import { useCreateSurvey } from "@/hooks/survey/useCreateSurvey";
import { sanitizeTiptapContent } from "@/lib/tiptap/utils";
import { Button } from "@repo/ui/components";
import { useAtomValue, useSetAtom } from "jotai";

const CREATE_SURVEY_MESSAGE = {
  SUCCESS: "설문지 생성에 성공했습니다.",
  ERROR: "설문지 생성에 실패했습니다.",
};

export function CreateSurveyButton() {
  const { handleCreateSurvey, isPending, disabled } = useCreateSurveyButton();

  return (
    <Button
      variant="primary"
      className="w-full"
      loading={isPending}
      onClick={handleCreateSurvey}
      disabled={disabled}
    >
      설문지 생성
    </Button>
  );
}

function useCreateSurveyButton() {
  const surveyTitle = useAtomValue(surveyTitleAtom);
  const surveyDescription = useAtomValue(surveyDescriptionAtom);
  const surveyTarget = useAtomValue(surveyTargetAtom);
  const selectedQuestions = useAtomValue(selectedQuestionAtom);
  const validation = useAtomValue(surveyValidationAtom);

  const deadlineDate = useAtomValue(surveyDeadlineDateAtom);
  const deadlineTime = useAtomValue(surveyDeadlineTimeAtom);

  const resetSurvey = useSetAtom(resetSurveyAtom);
  const pushAfter = usePushAfter();

  const { mutate, isPending } = useCreateSurvey({
    onSuccess: () => {
      resetSurvey();
      pushAfter("/me", () => {
        toast.success(CREATE_SURVEY_MESSAGE.SUCCESS);
      });
    },
    onError: () => {
      toast.warning(CREATE_SURVEY_MESSAGE.ERROR);
    },
  });

  const handleCreateSurvey = () => {
    mutate({
      title: surveyTitle,
      description: sanitizeTiptapContent(surveyDescription),
      target: surveyTarget.trim() || null,
      questionIds: Array.from(selectedQuestions).map(question => question.id),
      deadline: deadlineDate
        ? new Date(`${deadlineDate.toISOString().split("T")[0]}T${deadlineTime}`)
        : undefined,
    });
  };

  const disabled = !validation.isValid;

  return {
    handleCreateSurvey,
    isPending,
    disabled,
  };
}
