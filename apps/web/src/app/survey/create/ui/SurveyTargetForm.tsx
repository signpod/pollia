"use client";

import { surveyTargetAtom } from "@/atoms/survey/surveyAtoms";
import { Textarea } from "@repo/ui/components";
import { useAtom } from "jotai";
import { useCallback } from "react";

export function SurveyTargetForm() {
  const { target, handleChange } = useSurveyTargetForm();

  return (
    <Textarea
      label="설문 대상자"
      required={false}
      placeholder="설문 대상자를 입력해주세요 (예: 20대 여성, IT 업계 종사자)"
      maxLength={200}
      showLength={true}
      value={target}
      onChange={handleChange}
      rows={3}
      resize="none"
    />
  );
}

function useSurveyTargetForm() {
  const [target, setTarget] = useAtom(surveyTargetAtom);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTarget(e.target.value);
    },
    [setTarget],
  );

  return {
    target,
    handleChange,
  };
}
