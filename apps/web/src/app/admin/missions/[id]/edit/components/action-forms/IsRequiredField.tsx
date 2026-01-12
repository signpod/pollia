"use client";

import { NumberField } from "@/app/admin/components/common/NumberField";
import type { Control, FieldValues, Path } from "react-hook-form";

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
    <NumberField
      control={control}
      name={name}
      label="필수 응답"
      description="이 질문에 대한 응답을 필수로 요구합니다."
      disabled={disabled}
    />
  );
}
