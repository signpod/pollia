"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import { ActionToggleField } from "./ActionToggleField";

interface IsRequiredFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
}

export function IsRequiredField<T extends FieldValues>({
  control,
  name,
  disabled = false,
}: IsRequiredFieldProps<T>) {
  return (
    <ActionToggleField
      control={control}
      name={name}
      label="필수 응답"
      description="이 질문에 대한 응답을 필수로 요구합니다."
      disabled={disabled}
    />
  );
}
