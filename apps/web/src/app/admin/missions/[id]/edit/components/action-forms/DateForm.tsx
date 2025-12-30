"use client";

import { DateTimeForm } from "./DateTimeForm";
import type { ActionFormProps, DateFormData } from "./types";

export function DateForm(props: ActionFormProps<DateFormData>) {
  return (
    <DateTimeForm
      {...props}
      type="DATE"
      titlePlaceholder="예: 방문 가능한 날짜를 선택해주세요."
      selectionDescription="사용자가 선택할 수 있는 날짜 개수입니다. 비워두면 자동으로 1개로 설정됩니다."
    />
  );
}
