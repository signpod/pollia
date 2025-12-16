"use client";

import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
import { CharacterCounter } from "@/app/admin/components/common/InputField";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { Textarea } from "@/app/admin/components/shadcn-ui/textarea";
import { ACTION_DESCRIPTION_MAX_LENGTH, ACTION_TITLE_MAX_LENGTH } from "@/schemas/action";
import type { ReactNode } from "react";
import type { Control, FieldValues, Path, UseFormWatch } from "react-hook-form";

interface BaseActionFormFieldsProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  watch: UseFormWatch<TFieldValues>;
  isLoading?: boolean;
  titlePlaceholder?: string;
  mainImagePreviewUrl: string | null;
  onMainImageSelect: (file: File) => void;
  onMainImageDelete: () => void;
  children?: ReactNode;
}

export function BaseActionFormFields<TFieldValues extends FieldValues>({
  control,
  watch,
  isLoading = false,
  titlePlaceholder = "예: 가장 선호하는 옵션을 선택해주세요.",
  mainImagePreviewUrl,
  onMainImageSelect,
  onMainImageDelete,
  children,
}: BaseActionFormFieldsProps<TFieldValues>) {
  const titleValue = watch("title" as Path<TFieldValues>) as string | undefined;
  const descriptionValue = watch("description" as Path<TFieldValues>) as string | undefined;

  return (
    <>
      <FormField
        control={control}
        name={"title" as Path<TFieldValues>}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>
                제목 <span className="text-destructive">*</span>
              </FormLabel>
              <CharacterCounter current={titleValue?.length || 0} max={ACTION_TITLE_MAX_LENGTH} />
            </div>
            <FormControl>
              <Input
                placeholder={titlePlaceholder}
                maxLength={ACTION_TITLE_MAX_LENGTH}
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={"description" as Path<TFieldValues>}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>
                설명 <span className="text-muted-foreground">(선택)</span>
              </FormLabel>
              <CharacterCounter
                current={descriptionValue?.length || 0}
                max={ACTION_DESCRIPTION_MAX_LENGTH}
              />
            </div>
            <FormControl>
              <Textarea
                placeholder="액션에 대한 추가 설명을 입력하세요."
                maxLength={ACTION_DESCRIPTION_MAX_LENGTH}
                {...field}
                disabled={isLoading}
                rows={2}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          이미지 <span className="text-muted-foreground">(선택)</span>
        </Label>
        <div className="flex items-center gap-3">
          <ImageSelector
            size="large"
            imageUrl={mainImagePreviewUrl || undefined}
            onImageSelect={onMainImageSelect}
            onImageDelete={onMainImageDelete}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">액션에 표시될 이미지를 선택하세요.</p>
        </div>
      </div>

      {children}
    </>
  );
}
