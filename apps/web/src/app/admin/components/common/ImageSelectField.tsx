"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import type { Control, FieldValues, Path } from "react-hook-form";
import { ImageSelector, type ImageSelectorSize } from "./ImageSelector";

interface ImageSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description: string;
  onImageSelect: (file: File) => void;
  onImageDelete: () => void;
  disabled?: boolean;
  isOptional?: boolean;
  size?: ImageSelectorSize;
  className?: string;
}

export function ImageSelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  onImageSelect,
  onImageDelete,
  disabled = false,
  isOptional = false,
  size = "medium",
  className,
}: ImageSelectFieldProps<T>) {
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
            <ImageSelector
              size={size}
              imageUrl={field.value || undefined}
              onImageSelect={onImageSelect}
              onImageDelete={onImageDelete}
              disabled={disabled}
              className={className}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
