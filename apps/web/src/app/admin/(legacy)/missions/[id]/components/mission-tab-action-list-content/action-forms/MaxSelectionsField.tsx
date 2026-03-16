"use client";

import { NumberField } from "@/app/admin/components/common/NumberField";
import type { Control, FieldValues, Path } from "react-hook-form";

interface MaxSelectionsFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
  isOptional?: boolean;
}

export function MaxSelectionsField<T extends FieldValues>({
  control,
  name,
  disabled = false,
  isOptional = false,
}: MaxSelectionsFieldProps<T>) {
  return (
    <NumberField
      control={control}
      name={name}
      label="최대 선택 가능 개수"
      description="응답자가 선택할 수 있는 최대 옵션 개수를 설정합니다."
      disabled={disabled}
      isOptional={isOptional}
    />
  );
}
