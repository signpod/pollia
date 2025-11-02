"use client";

import {
  selectedQuestionTypesAtom,
  toggleQuestionTypeAtom,
} from "@/atoms/create";
import { SurveyQuestionType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import { useAtomValue, useSetAtom } from "jotai";
import { FilterIcon } from "lucide-react";
import { TypeTag } from "./TypeTag";
import { SURVEY_QUESTION_TYPES } from "@/constants/survey";

export function SurveyQuestionFilter() {
  const selectedQuestionTypes = useAtomValue(selectedQuestionTypesAtom);
  const toggleQuestionType = useSetAtom(toggleQuestionTypeAtom);

  const isSelected = (questionType: SurveyQuestionType) => {
    return selectedQuestionTypes?.has(questionType);
  };

  return (
    <section className="border-default flex flex-col gap-4 rounded-md border p-4">
      <div className="flex items-center gap-2">
        <FilterIcon className="size-4 text-zinc-400" />
        <Typo.Body size="medium">질문 유형 필터 옵션</Typo.Body>
      </div>
      <ul className="flex items-center gap-4">
        {SURVEY_QUESTION_TYPES.map((questionType) => (
          <li key={questionType}>
            <TypeTag
              type={questionType}
              as="button"
              onClick={() => toggleQuestionType(questionType)}
              selected={isSelected(questionType)}
              className="cursor-pointer"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
