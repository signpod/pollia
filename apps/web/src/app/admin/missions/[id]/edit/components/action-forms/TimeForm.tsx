"use client";

import { DateTimeForm } from "./DateTimeForm";
import type { ActionFormProps, TimeFormData } from "./types";

export function TimeForm(props: ActionFormProps<TimeFormData>) {
  return (
    <DateTimeForm
      {...props}
      type="TIME"
      titlePlaceholder="예: 방문 가능한 시간을 선택해주세요."
      selectionDescription="사용자가 선택할 수 있는 시간 개수입니다. 비워두면 1개만 선택 가능합니다."
    />
  );
}
