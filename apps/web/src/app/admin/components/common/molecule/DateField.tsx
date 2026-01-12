"use client";

import { DatePicker } from "@/app/admin/components/common/atom/DatePicker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import type { Control, FieldValues, Path } from "react-hook-form";

interface DateFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description: string;
  placeholder?: string;
  disabled?: boolean;
  isOptional?: boolean;
}

export function DateField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  isOptional = false,
}: DateFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <FormLabel className="text-sm font-medium">
              {label} {!isOptional && <span className="text-destructive">*</span>}
            </FormLabel>
            <p className="text-xs text-muted-foreground">{description}</p>
            <FormMessage />
          </div>
          <FormControl>
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
