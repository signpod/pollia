'use client';

import { Input } from '@repo/ui/components';
import { useAtom, useAtomValue } from 'jotai';
import {
  surveyTitleAtom,
  surveyValidationAtom,
  surveyTitleTouchedAtom,
} from '@/atoms/create/surveyAtoms';

export function SurveyTitleForm() {
  const [title, setTitle] = useAtom(surveyTitleAtom);
  const validation = useAtomValue(surveyValidationAtom);
  const [touched, setTouched] = useAtom(surveyTitleTouchedAtom);

  const handleBlur = () => {
    setTouched(true);
  };

  const errorMessage =
    touched && validation.errors.title ? validation.errors.title : undefined;

  return (
    <Input
      label="설문조사지 제목"
      required
      placeholder="설문조사지 제목을 입력해주세요"
      maxLength={30}
      showLength={true}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={handleBlur}
      errorMessage={errorMessage}
    />
  );
}
