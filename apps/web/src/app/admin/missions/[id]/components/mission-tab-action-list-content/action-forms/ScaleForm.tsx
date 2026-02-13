"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { type UploadedImageData, useSingleImage } from "@/app/admin/hooks/admin-image";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { BaseActionFormFields } from "./BaseActionForm";
import { ScaleFormOptionCard } from "./ScaleFormOptionCard";
import {
  SCALE_MAX_OPTIONS,
  SCALE_MIN_OPTIONS,
  type ScaleFormInput,
  scaleFormSchema,
} from "./schemas";
import type { ActionFormProps, ActionOptionInput, ScaleFormData } from "./types";

export function ScaleForm({
  isLoading = false,
  onSubmit,
  onCancel,
  initialData,
}: ActionFormProps<ScaleFormData>) {
  const isEditMode = !!initialData;

  const form = useForm<ScaleFormInput>({
    resolver: zodResolver(scaleFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl,
      imageFileUploadId: initialData?.imageFileUploadId,
      isRequired: initialData?.isRequired ?? true,
      options:
        initialData?.options?.map(opt => ({
          id: opt.id ?? crypto.randomUUID(),
          title: opt.title,
          description: opt.description || "",
        })) || [],
    },
    mode: "onChange",
  });

  const { fields, append, remove, swap } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const mainImage = useSingleImage({
    initialUrl: initialData?.imageUrl,
    initialFileUploadId: initialData?.imageFileUploadId,
    bucket: STORAGE_BUCKETS.ACTION_IMAGES,
    onUploadSuccess: (data: UploadedImageData) => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("imageFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
  });

  const handleSubmit = form.handleSubmit((data: ScaleFormInput) => {
    const formattedOptions: ActionOptionInput[] = data.options.map(opt => ({
      id: opt.id,
      title: opt.title,
      description: opt.description || undefined,
    }));

    onSubmit({
      type: "SCALE",
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || undefined,
      imageFileUploadId: data.imageFileUploadId,
      options: formattedOptions,
      isRequired: data.isRequired,
    });
  });

  const handleAddOption = () => {
    append({
      id: crypto.randomUUID(),
      title: "",
      description: "",
    });
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      swap(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      swap(index, index + 1);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <BaseActionFormFields
          control={form.control}
          isLoading={isLoading}
          titlePlaceholder="예: 서비스 만족도를 평가해주세요."
          mainImagePreviewUrl={mainImage.previewUrl}
          onMainImageSelect={mainImage.upload}
          onMainImageDelete={() => {
            mainImage.discard();
            form.setValue("imageUrl", null, { shouldDirty: true });
            form.setValue("imageFileUploadId", null, { shouldDirty: true });
          }}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              척도 <span className="text-destructive">*</span>
            </Label>
            {form.formState.errors.options?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.options.message}</p>
            )}
          </div>

          {fields.length > 0 ? (
            <div>
              {fields.map((field, index) => (
                <ScaleFormOptionCard
                  key={field.id}
                  index={index}
                  total={fields.length}
                  minOptions={SCALE_MIN_OPTIONS}
                  title={form.watch(`options.${index}.title`)}
                  description={form.watch(`options.${index}.description`)}
                  titlePlaceholder="척도 레이블"
                  descriptionPlaceholder="척도 설명 (선택)"
                  onTitleChange={value => {
                    form.setValue(`options.${index}.title`, value, { shouldValidate: true });
                    form.trigger("options");
                  }}
                  onDescriptionChange={value =>
                    form.setValue(`options.${index}.description`, value)
                  }
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  onDelete={() => remove(index)}
                  disabled={isLoading}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
              <p className="text-sm">척도가 없습니다.</p>
              <p className="text-xs mt-1">아래 버튼을 눌러 척도를 추가하세요.</p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleAddOption}
            disabled={isLoading || fields.length >= SCALE_MAX_OPTIONS}
          >
            <Plus className="size-4 mr-2" />
            척도 추가
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {isEditMode ? "닫기" : "이전"}
          </Button>
          <Button type="submit" disabled={isLoading || mainImage.isUploading}>
            {isLoading
              ? isEditMode
                ? "수정 중..."
                : "생성 중..."
              : isEditMode
                ? "수정하기"
                : "생성하기"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
