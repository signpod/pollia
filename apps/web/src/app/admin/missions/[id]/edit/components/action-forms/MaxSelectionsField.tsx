"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import type { Control, FieldValues, Path } from "react-hook-form";

interface MaxSelectionsFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  maxOptions: number;
  disabled?: boolean;
}

export function MaxSelectionsField<T extends FieldValues>({
  control,
  name,
  maxOptions,
  disabled = false,
}: MaxSelectionsFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            최대 선택 가능 개수 <span className="text-destructive">*</span>
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              min={1}
              max={maxOptions || 10}
              placeholder="1"
              {...field}
              onChange={e => field.onChange(Number(e.target.value) || 1)}
              disabled={disabled}
              className="w-32"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
