"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { BaseActionFormFields } from "./BaseActionForm";
import { OptionCard } from "./OptionCard";
import { type ScaleFormInput, scaleFormSchema } from "./schemas";
import type { ActionFormProps, ActionOptionInput, ScaleFormData } from "./types";

const MIN_OPTIONS = 3;
const MAX_OPTIONS = 10;

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
      imageUrl: initialData?.imageUrl || "",
      options:
        initialData?.options?.map(opt => ({
          id: crypto.randomUUID(),
          title: opt.title,
          description: opt.description || "",
          imageUrl: opt.imageUrl || "",
        })) || [],
    },
    mode: "onChange",
  });

  const { fields, append, remove, swap } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const imagePreviewUrls = new Map<string, string>();
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string | null>(
    initialData?.imageUrl || null,
  );

  const handleSubmit = form.handleSubmit((data: ScaleFormInput) => {
    const formattedOptions: ActionOptionInput[] = data.options.map(opt => ({
      title: opt.title,
      description: opt.description || undefined,
      imageUrl: opt.imageUrl || undefined,
    }));

    onSubmit({
      type: "SCALE",
      title: data.title,
      description: data.description,
      options: formattedOptions,
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

  const handleImageSelect = (index: number, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    const fieldId = fields[index]?.id;
    if (fieldId) {
      imagePreviewUrls.set(fieldId, previewUrl);
    }
    form.setValue(`options.${index}.imageUrl`, previewUrl);
  };

  const handleImageDelete = (index: number) => {
    const fieldId = fields[index]?.id;
    if (fieldId) {
      const previewUrl = imagePreviewUrls.get(fieldId);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        imagePreviewUrls.delete(fieldId);
      }
    }
    form.setValue(`options.${index}.imageUrl`, undefined);
  };

  const handleMainImageSelect = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setMainImagePreviewUrl(previewUrl);
    form.setValue("imageUrl", previewUrl);
  };

  const handleMainImageDelete = () => {
    if (mainImagePreviewUrl) {
      URL.revokeObjectURL(mainImagePreviewUrl);
      setMainImagePreviewUrl(null);
    }
    form.setValue("imageUrl", "");
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <BaseActionFormFields
          control={form.control}
          isLoading={isLoading}
          titlePlaceholder="예: 서비스 만족도를 평가해주세요."
          mainImagePreviewUrl={mainImagePreviewUrl}
          onMainImageSelect={handleMainImageSelect}
          onMainImageDelete={handleMainImageDelete}
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
                <OptionCard
                  key={field.id}
                  index={index}
                  total={fields.length}
                  minOptions={MIN_OPTIONS}
                  title={form.watch(`options.${index}.title`)}
                  description={form.watch(`options.${index}.description`)}
                  imagePreviewUrl={form.watch(`options.${index}.imageUrl`)}
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
                  onImageSelect={file => handleImageSelect(index, file)}
                  onImageDelete={() => handleImageDelete(index)}
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
            disabled={isLoading || fields.length >= MAX_OPTIONS}
          >
            <Plus className="size-4 mr-2" />
            척도 추가
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {isEditMode ? "닫기" : "이전"}
          </Button>
          <Button type="submit" disabled={isLoading}>
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
