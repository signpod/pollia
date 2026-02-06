"use client";

import { DateTimeForm } from "./DateTimeForm";
import type { ActionFormProps, DateFormData } from "./types";

export function DateForm(props: ActionFormProps<DateFormData>) {
  return (
    <DateTimeForm {...props} type="DATE" titlePlaceholder="예: 방문 가능한 날짜를 선택해주세요." />
  );
}
