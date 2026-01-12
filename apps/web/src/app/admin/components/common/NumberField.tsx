"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { useEffect, useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

interface NumberFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description: string;
  placeholder?: string;
  disabled?: boolean;
  isOptional?: boolean;
}

export function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  isOptional = false,
}: NumberFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <NumberFieldInput
          field={field}
          label={label}
          description={description}
          placeholder={placeholder ?? ""}
          disabled={disabled}
          isOptional={isOptional}
        />
      )}
    />
  );
}

interface NumberFieldInputProps {
  field: {
    ref: React.Ref<HTMLInputElement>;
    name: string;
    value: number | undefined;
    onChange: (value: number | undefined) => void;
    onBlur: () => void;
  };
  label: string;
  description: string;
  placeholder: string;
  disabled: boolean;
  isOptional: boolean;
}

function NumberFieldInput({
  field,
  label,
  description,
  placeholder,
  disabled,
  isOptional,
}: NumberFieldInputProps) {
  const [localValue, setLocalValue] = useState<string>(
    field.value != null ? String(field.value) : "",
  );

  useEffect(() => {
    setLocalValue(field.value != null ? String(field.value) : "");
  }, [field.value]);

  const handleBlur = () => {
    field.onBlur();

    if (localValue === "") {
      field.onChange(undefined);
    } else {
      const numValue = Number(localValue);
      if (!Number.isNaN(numValue)) {
        field.onChange(numValue);
      }
    }
  };

  return (
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
          ref={field.ref}
          name={field.name}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={placeholder}
          value={localValue}
          onChange={e => {
            const value = e.target.value.replace(/[^0-9]/g, "");
            setLocalValue(value);
          }}
          onBlur={handleBlur}
          disabled={disabled}
          className="w-20 text-center"
        />
      </FormControl>
    </FormItem>
  );
}
