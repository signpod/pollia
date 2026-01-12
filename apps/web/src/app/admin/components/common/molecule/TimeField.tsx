"use client";

import { TimePicker } from "@/app/admin/components/common/atom/TimePicker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import type { Control, FieldValues, Path } from "react-hook-form";

interface TimeFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description: string;
  disabled?: boolean;
  isOptional?: boolean;
  minuteStep?: 1 | 5 | 10 | 15 | 30;
}

export function TimeField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
  isOptional = false,
  minuteStep = 5,
}: TimeFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="rounded-lg border p-3 space-y-3">
          <div className="space-y-0.5">
            <FormLabel className="text-sm font-medium">
              {label} {!isOptional && <span className="text-destructive">*</span>}
            </FormLabel>
            <p className="text-xs text-muted-foreground">{description}</p>
            <FormMessage />
          </div>
          <FormControl>
            <TimePicker
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              minuteStep={minuteStep}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
