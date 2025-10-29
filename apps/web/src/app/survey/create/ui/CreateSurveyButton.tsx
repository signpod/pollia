'use client';

import { Button, toast } from '@repo/ui/components';
import { useCreateSurvey } from '@/hooks/survey/useCreateSurvey';
import {
  selectedQuestionCountAtom,
  selectedQuestionIdsAtom,
  surveyTitleAtom,
  surveyValidationAtom,
} from '@/atoms/create/surveyAtoms';
import { useAtomValue } from 'jotai';

const CREATE_SURVEY_MESSAGE = {
  SUCCESS: '설문조사지 생성에 성공했습니다.',
  ERROR: '설문조사지 생성에 실패했습니다.',
};

export function CreateSurveyButton() {
  const surveyTitle = useAtomValue(surveyTitleAtom);
  const selectedQuestionIds = useAtomValue(selectedQuestionIdsAtom);
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
      questionIds: selectedQuestionIds,
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
