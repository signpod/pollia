"use client";
import { baseInfoSchema } from "@/schemas/survey/baseInfoSchema";
<<<<<<< Updated upstream
import { } from "@/atoms/create/surveyAtoms";
=======
import {
  surveyTitleAtom,
} from "@/atoms/survey/surveyAtoms";
>>>>>>> Stashed changes
import { Input } from "@repo/ui/components";
import { useAtom } from "jotai";
import { useCallback, useState } from "react";

export function SurveyTitleForm() {
  const { title, handleChange, errorMessage, handleBlur, handleFocus } = useSurveyTitleForm();

  return (
    <Input
      label="설문지 제목"
      required
      placeholder="설문지 제목을 입력해주세요"
      maxLength={30}
      showLength={true}
      value={title}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      errorMessage={errorMessage}
    />
  );
}

function useSurveyTitleForm() {
  const [title, setTitle] = useAtom(surveyTitleAtom);
  const [touched, setTouched] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  const handleBlur = useCallback(() => {
    const trimmed = title.trim();
    setTitle(trimmed);
    setTouched(true);

    try {
      const result = baseInfoSchema.safeParse({ title: trimmed });

      if (!result.success) {
        const titleError = result.error.issues.find(issue => issue.path[0] === "title");
        setError(titleError?.message);
      } else {
        setError(undefined);
      }
    } catch {
      setError(undefined);
    }
  }, [title, setTitle]);

  const handleFocus = useCallback(() => {
    setTouched(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
  };

  const errorMessage = touched ? error : undefined;

  return {
    title,
    handleChange,
    errorMessage,
    handleBlur,
    handleFocus,
  };
}
