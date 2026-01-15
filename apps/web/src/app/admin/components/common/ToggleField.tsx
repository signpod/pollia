"use client";

import { FormControl, FormField, FormItem, FormLabel } from "@/app/admin/components/shadcn-ui/form";
import { Switch } from "@/app/admin/components/shadcn-ui/switch";
import type { Control, FieldValues, Path } from "react-hook-form";

interface ToggleFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description: string;
  disabled?: boolean;
}

export function ToggleField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
}: ToggleFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <FormLabel className="text-sm font-medium">{label}</FormLabel>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
