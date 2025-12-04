"use client";

import {
  missionDeadlineDateAtom,
  missionDeadlineTimeAtom,
  missionDescriptionAtom,
  missionEstimatedMinutesAtom,
  missionTargetAtom,
  missionTitleAtom,
  missionValidationAtom,
  resetMissionAtom,
  selectedActionAtom,
} from "@/atoms/mission/missionAtoms";
import { toast } from "@/components/common/Toast";
import { usePushAfter } from "@/hooks/common/usePushAfter";
import { useCreateMission } from "@/hooks/mission/useCreateMission";
import { combineDateAndTime } from "@/lib/date";
import { sanitizeTiptapContent } from "@/lib/tiptap/utils";
import { Button } from "@repo/ui/components";
import { useAtomValue, useSetAtom } from "jotai";

const CREATE_SURVEY_MESSAGE = {
  SUCCESS: "설문지 생성에 성공했습니다.",
  ERROR: "설문지 생성에 실패했습니다.",
};

export function CreateMissionButton() {
  const { handleCreateMission, isPending, disabled } = useCreateMissionButton();

  return (
    <Button
      variant="primary"
      className="w-full"
      loading={isPending}
      onClick={handleCreateMission}
      disabled={disabled}
    >
      설문지 생성
    </Button>
  );
}

function useCreateMissionButton() {
  const surveyTitle = useAtomValue(missionTitleAtom);
  const surveyDescription = useAtomValue(missionDescriptionAtom);
  const surveyTarget = useAtomValue(missionTargetAtom);
  const selectedQuestions = useAtomValue(selectedActionAtom);
  const validation = useAtomValue(missionValidationAtom);

  const deadlineDate = useAtomValue(missionDeadlineDateAtom);
  const deadlineTime = useAtomValue(missionDeadlineTimeAtom);
  const estimatedMinutes = useAtomValue(missionEstimatedMinutesAtom);

  const resetSurvey = useSetAtom(resetMissionAtom);
  const pushAfter = usePushAfter();

  const { mutate, isPending } = useCreateMission({
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

  const handleCreateMission = () => {
    mutate({
      title: surveyTitle,
      description: sanitizeTiptapContent(surveyDescription),
      target: surveyTarget.trim() || null,
      questionIds: selectedQuestions.map(question => question.id),
      deadline: deadlineDate ? combineDateAndTime(deadlineDate, deadlineTime) : undefined,
      estimatedMinutes,
    });
  };

  const disabled = !validation.isValid;

  return {
    handleCreateMission,
    isPending,
    disabled,
  };
}
