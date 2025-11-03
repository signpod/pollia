"use client";

<<<<<<< Updated upstream
import { surveyTitleAtom, surveyValidationAtom } from "@/atoms/create/surveyAtoms";
=======
import {
  surveyTitleAtom,
  surveyTitleTouchedAtom,
  surveyValidationAtom,
} from "@/atoms/survey/surveyAtoms";
>>>>>>> Stashed changes
import { Input } from "@repo/ui/components";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";

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
  const [touched, setTouched] = useState<boolean>(false);

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
