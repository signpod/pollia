"use client";

import { useAtom, useAtomValue } from "jotai";
import { Input } from "@repo/ui/components";
import {
  surveyTitleAtom,
  surveyTitleTouchedAtom,
  surveyValidationAtom,
} from "@/atoms/create/surveyAtoms";

export function SurveyTitleForm() {
  const { title, handleChange, errorMessage, handleBlur } = useSurveyTitleForm();

  return (
    <Input
      label="설문조사지 제목"
      required
      placeholder="설문조사지 제목을 입력해주세요"
      maxLength={30}
      showLength={true}
      value={title}
      onChange={handleChange}
      onBlur={handleBlur}
      errorMessage={errorMessage}
    />
  );
}

function useSurveyTitleForm() {
  const [title, setTitle] = useAtom(surveyTitleAtom);
  const validation = useAtomValue(surveyValidationAtom);
  const [touched, setTouched] = useAtom(surveyTitleTouchedAtom);

  const handleBlur = () => {
    setTouched(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
  };

  const errorMessage = touched && validation.errors.title ? validation.errors.title : undefined;

  return {
    title,
    handleChange,
    errorMessage,
    handleBlur,
  };
}
