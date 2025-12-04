"use client";

import { selectedActionTypesAtom, toggleActionTypeAtom } from "@/atoms/mission/missionAtoms";
import { ACTION_TYPES } from "@/constants/action";
import { ActionType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import { useAtomValue, useSetAtom } from "jotai";
import { FilterIcon } from "lucide-react";
import { TypeTag } from "./TypeTag";

// TODO: 이미지, 태그 추가 시 수정 필요
const SUPPORTED_ACTION_TYPES: ActionType[] = [
  ActionType.MULTIPLE_CHOICE,
  ActionType.SCALE,
  ActionType.SUBJECTIVE,
];

export function ActionFilter() {
  const selectedActionTypes = useAtomValue(selectedActionTypesAtom);
  const toggleActionType = useSetAtom(toggleActionTypeAtom);

  const isSelected = (actionType: ActionType) => {
    return selectedActionTypes?.has(actionType);
  };

  const supportedTypes = ACTION_TYPES.filter(type => SUPPORTED_ACTION_TYPES.includes(type));

  return (
    <section className="border-default flex flex-col gap-4 rounded-md border p-4">
      <div className="flex items-center gap-2">
        <FilterIcon className="size-4 text-zinc-400" />
        <Typo.Body size="medium">질문 유형 필터 옵션</Typo.Body>
      </div>
      <ul className="flex items-center gap-4">
        {supportedTypes.map(questionType => (
          <li key={questionType}>
            <TypeTag
              type={questionType}
              as="button"
              onClick={() => toggleActionType(questionType)}
              selected={isSelected(questionType)}
              className="cursor-pointer"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
