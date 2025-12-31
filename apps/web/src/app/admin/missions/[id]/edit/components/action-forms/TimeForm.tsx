"use client";

import { DateTimeForm } from "./DateTimeForm";
import type { ActionFormProps, TimeFormData } from "./types";

export function TimeForm(props: ActionFormProps<TimeFormData>) {
  return (
    <DateTimeForm {...props} type="TIME" titlePlaceholder="예: 방문 가능한 시간을 선택해주세요." />
  );
}
