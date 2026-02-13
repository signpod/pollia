"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { cn } from "@/app/admin/lib/utils";
import type { Control, FieldValues, Path } from "react-hook-form";

interface CharacterCounterProps {
  current: number;
  max: number;
}

function CharacterCounter({ current, max }: CharacterCounterProps) {
  const isOver = current > max;
  return (
    <span className={cn("text-xs", isOver ? "text-destructive" : "text-muted-foreground")}>
      {current}/{max}자
    </span>
  );
}

interface InputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description: string;
  placeholder?: string;
  disabled?: boolean;
  isOptional?: boolean;
  maxLength?: number;
  showCounter?: boolean;
}

export function InputField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  isOptional = false,
  maxLength,
  showCounter = false,
}: InputFieldProps<T>) {
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
            <Input {...field} placeholder={placeholder} disabled={disabled} maxLength={maxLength} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export { CharacterCounter };
