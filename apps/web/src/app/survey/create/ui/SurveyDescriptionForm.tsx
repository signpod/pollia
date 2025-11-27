"use client";

import { surveyDescriptionAtom } from "@/atoms/survey/surveyAtoms";
import { cleanTiptapHTML } from "@/lib/utils";
import { LabelText, TiptapEditor } from "@repo/ui/components";
import { useAtom } from "jotai";
import { useCallback } from "react";

export function SurveyDescriptionForm() {
  const { description, handleUpdate } = useSurveyDescriptionForm();

  return (
    <div className="flex flex-col gap-2">
      <LabelText required={false}>설문지 설명</LabelText>
      <TiptapEditor
        content={description}
        onUpdate={handleUpdate}
        placeholder="설문지에 대한 설명을 입력해주세요"
        showToolbar={true}
        className="min-h-[200px]"
      />
    </div>
  );
}

function useSurveyDescriptionForm() {
  const [description, setDescription] = useAtom(surveyDescriptionAtom);

  const handleUpdate = useCallback(
    (content: string) => {
      const cleaned = cleanTiptapHTML(content);
      setDescription(cleaned);
    },
    [setDescription],
  );

  return {
    description,
    handleUpdate,
  };
}
