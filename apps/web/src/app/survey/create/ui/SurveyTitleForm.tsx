"use client";
import { surveyTitleAtom } from "@/atoms/survey/surveyAtoms";
// TODO: @/schemas_legacy는 deprecated. 새로운 @/schemas/{domain}/ 스키마로 교체 필요
import { baseInfoSchema } from "@/schemas_legacy/survey/baseInfoSchema";
import { Input } from "@repo/ui/components";
import { useAtom } from "jotai";
import { useCallback, useState } from "react";

export function SurveyTitleForm() {
  const { title, handleChange, errorMessage, handleBlur } = useSurveyTitleForm();

  return (
    <Input
      label="설문지 제목"
      required
      placeholder="설문지 제목을 입력해주세요"
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
  const [error, setError] = useState<string | undefined>();

  const handleBlur = useCallback(() => {
    const trimmed = title.trim();
    setTitle(trimmed);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
  };

  const errorMessage = error;

  return {
    title,
    handleChange,
    errorMessage,
    handleBlur,
  };
}
