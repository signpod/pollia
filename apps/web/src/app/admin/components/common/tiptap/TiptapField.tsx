"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import { cn } from "@/app/admin/lib/utils";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { CharacterCounter } from "../InputField";
import { TiptapEditor } from "./TiptapEditor";

function getTextLength(html: string): number {
  if (!html) return 0;

  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent?.replace(/\u00a0/g, " ").trim().length || 0;
  }

  return html
    .replace(/<[^>]*>/g, "")
    .replace(/(&nbsp;|&#160;|&#xA0;)/gi, " ")
    .trim().length;
}

interface TiptapFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description: string;
  placeholder?: string;
  disabled?: boolean;
  isOptional?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  showToolbar?: boolean;
  minHeight?: string;
  className?: string;
}

export function TiptapField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  isOptional = false,
  maxLength,
  showCounter = false,
  showToolbar = true,
  minHeight = "200px",
  className,
}: TiptapFieldProps<T>) {
  const fieldValue = useWatch({ control, name });
  const textLength = getTextLength(fieldValue || "");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className="space-y-2 rounded-lg border p-3">
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">
                  {label} {!isOptional && <span className="text-destructive">*</span>}
                </FormLabel>
                {showCounter && maxLength && (
                  <CharacterCounter current={textLength} max={maxLength} />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
              <FormMessage />
            </div>
            <FormControl>
              <TiptapEditor
                content={field.value || ""}
                onUpdate={content => {
                  const nextTextLength = getTextLength(content || "");
                  field.onChange(nextTextLength === 0 ? "" : content);
                }}
                placeholder={placeholder}
                showToolbar={showToolbar}
                editable={!disabled}
                className={cn(minHeight && `min-h-[${minHeight}]`, className)}
              />
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}
