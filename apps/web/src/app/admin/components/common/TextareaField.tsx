"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import { Textarea } from "@/app/admin/components/shadcn-ui/textarea";
import type { Control, FieldValues, Path } from "react-hook-form";
import { CharacterCounter } from "./InputField";

interface TextareaFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description: string;
  placeholder?: string;
  disabled?: boolean;
  isOptional?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  rows?: number;
  className?: string;
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  isOptional = false,
  maxLength,
  showCounter = false,
  rows = 4,
  className,
}: TextareaFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2 rounded-lg border p-3">
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <FormLabel className="text-sm font-medium">
                {label} {!isOptional && <span className="text-destructive">*</span>}
              </FormLabel>
              {showCounter && maxLength && (
                <CharacterCounter current={field.value?.length || 0} max={maxLength} />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
            <FormMessage />
          </div>
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              rows={rows}
              className={className}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
