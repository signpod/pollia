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

interface ActionNumberFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description: string;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
  isOptional?: boolean;
}

export function ActionNumberField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  min = 1,
  max = 10,
  placeholder = "1",
  disabled = false,
  isOptional = false,
}: ActionNumberFieldProps<T>) {
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
            <Input
              type="number"
              min={min}
              max={max}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ""}
              onChange={e => {
                const value = e.target.value ? Number(e.target.value) : undefined;
                field.onChange(isOptional ? value : value || min);
              }}
              disabled={disabled}
              className="w-20 text-center"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
