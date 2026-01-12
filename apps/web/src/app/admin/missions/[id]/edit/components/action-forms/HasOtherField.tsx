"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import { ActionToggleField } from "./ActionToggleField";

interface HasOtherFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
}

export function HasOtherField<T extends FieldValues>({
  control,
  name,
  disabled = false,
}: HasOtherFieldProps<T>) {
  return (
    <ActionToggleField
      control={control}
      name={name}
      label="기타 옵션 허용"
      description="응답자가 직접 텍스트를 입력할 수 있는 기타 옵션을 추가합니다."
      disabled={disabled}
    />
  );
}
