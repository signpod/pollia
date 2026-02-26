"use client";

import { cn } from "@/lib/utils";
import { LabelText, TiptapEditor, Typo } from "@repo/ui/components";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CreateMissionFormData } from "../schema";

function decodeHtmlEntities(text: string): string {
  const namedEntities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  };

  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isNaN(code) ? `&${entity};` : String.fromCodePoint(code);
    }

    if (entity.startsWith("#")) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isNaN(code) ? `&${entity};` : String.fromCodePoint(code);
    }

    return namedEntities[entity] ?? `&${entity};`;
  });
}

function getTextLength(html: string): number {
  if (!html) return 0;

  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent?.replace(/\u00a0/g, " ").trim().length || 0;
  }

  const textWithoutTags = html.replace(/<[^>]*>/g, "");
  const decodedText = decodeHtmlEntities(textWithoutTags);
  return decodedText.trim().length;
}

interface CreateTiptapFieldProps {
  name: "description";
  label: string;
  description?: string;
  placeholder?: string;
  isOptional?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  showToolbar?: boolean;
  minHeightClassName?: string;
  className?: string;
}

export function CreateTiptapField({
  name,
  label,
  description,
  placeholder,
  isOptional = false,
  maxLength,
  showCounter = true,
  showToolbar = true,
  minHeightClassName = "min-h-[200px]",
  className,
}: CreateTiptapFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateMissionFormData>();
  const fieldValue = useWatch({ control, name });
  const textLength = getTextLength(fieldValue || "");
  const fieldError = errors[name]?.message;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <LabelText required={!isOptional}>{label}</LabelText>
          {showCounter && maxLength ? (
            <Typo.Body
              size="small"
              className={cn(textLength > maxLength ? "text-red-500" : "text-zinc-400")}
            >
              {textLength}/{maxLength}
            </Typo.Body>
          ) : null}
        </div>
        {description ? (
          <Typo.Body size="medium" className="text-left text-zinc-400">
            {description}
          </Typo.Body>
        ) : null}
      </div>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TiptapEditor
            content={field.value || ""}
            onUpdate={content => {
              const nextTextLength = getTextLength(content || "");
              field.onChange(nextTextLength === 0 ? undefined : content);
            }}
            placeholder={placeholder}
            showToolbar={showToolbar}
            editable
            className={cn(
              "rounded-sm bg-white ring-1 ring-zinc-200 focus-within:ring-violet-500",
              fieldError && "ring-red-500 focus-within:ring-red-500",
              minHeightClassName,
              className,
            )}
          />
        )}
      />

      {fieldError && (
        <Typo.Body size="medium" className="text-left text-red-500">
          {fieldError}
        </Typo.Body>
      )}
    </div>
  );
}
