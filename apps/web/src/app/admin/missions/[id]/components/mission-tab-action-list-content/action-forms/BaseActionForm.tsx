"use client";

import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
import { InputField } from "@/app/admin/components/common/InputField";
import { TiptapField } from "@/app/admin/components/common/tiptap";
import { FormField, FormItem, FormLabel, FormMessage } from "@/app/admin/components/shadcn-ui/form";
import { ACTION_DESCRIPTION_MAX_LENGTH, ACTION_TITLE_MAX_LENGTH } from "@/schemas/action";
import type { ReactNode } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { IsRequiredField } from "./IsRequiredField";

interface BaseActionFormFieldsProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  isLoading?: boolean;
  titlePlaceholder?: string;
  mainImagePreviewUrl: string | null;
  onMainImageSelect: (file: File) => void;
  onMainImageDelete: () => void;
  hideIsRequired?: boolean;
  children?: ReactNode;
}

export function BaseActionFormFields<TFieldValues extends FieldValues>({
  control,
  isLoading = false,
  titlePlaceholder = "예: 가장 선호하는 옵션을 선택해주세요.",
  mainImagePreviewUrl,
  onMainImageSelect,
  onMainImageDelete,
  hideIsRequired = false,
  children,
}: BaseActionFormFieldsProps<TFieldValues>) {
  return (
    <>
      <InputField
        control={control}
        name={"title" as Path<TFieldValues>}
        label="제목"
        description="액션의 제목을 입력하세요."
        placeholder={titlePlaceholder}
        maxLength={ACTION_TITLE_MAX_LENGTH}
        showCounter
        disabled={isLoading}
      />

      <TiptapField
        control={control}
        name={"description" as Path<TFieldValues>}
        label="설명"
        description="액션에 대한 추가 설명을 입력하세요."
        placeholder="액션에 대한 추가 설명을 입력하세요."
        maxLength={ACTION_DESCRIPTION_MAX_LENGTH}
        showCounter
        showToolbar
        minHeight="120px"
        disabled={isLoading}
        isOptional
      />

      <FormField
        control={control}
        name={"imageUrl" as Path<TFieldValues>}
        render={({ field }) => (
          <FormItem className="rounded-lg border p-3">
            <div className="flex gap-4">
              <ImageSelector
                imageUrl={mainImagePreviewUrl || field.value || undefined}
                onImageSelect={onMainImageSelect}
                onImageDelete={() => {
                  onMainImageDelete();
                  field.onChange(null);
                }}
                disabled={isLoading}
              />
              <div className="space-y-0.5 py-1">
                <FormLabel className="text-sm font-medium">
                  이미지 <span className="text-muted-foreground">(선택)</span>
                </FormLabel>
                <p className="text-xs text-muted-foreground">액션에 표시될 이미지를 선택하세요.</p>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {!hideIsRequired && (
        <IsRequiredField
          control={control}
          name={"isRequired" as Path<TFieldValues>}
          disabled={isLoading}
        />
      )}

      {children}
    </>
  );
}
