"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import {
  useAdminMultipleImages,
  useAdminSingleImage,
} from "@/app/admin/hooks/use-admin-image-upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { BaseActionFormFields } from "./BaseActionForm";
import { MaxSelectionsField } from "./MaxSelectionsField";
import { TagFormOptionCard } from "./TagFormOptionCard";
import { type TagFormInput, tagFormSchema } from "./schemas";
import type { ActionFormProps, ActionOptionInput, TagFormData } from "./types";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

export function TagForm({
  isLoading = false,
  onSubmit,
  onCancel,
  initialData,
}: ActionFormProps<TagFormData>) {
  const isEditMode = !!initialData;

  const form = useForm<TagFormInput>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      maxSelections: initialData?.maxSelections ?? 1,
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

  const mainImage = useAdminSingleImage({ initialUrl: initialData?.imageUrl });
  const optionImages = useAdminMultipleImages();

  const handleSubmit = form.handleSubmit((data: TagFormInput) => {
    const formattedOptions: ActionOptionInput[] = data.options.map((opt, index) => {
      const fieldId = fields[index]?.id;
      const uploadedData = fieldId ? optionImages.getUploadedData(fieldId) : undefined;

      return {
        title: opt.title,
        description: opt.description || undefined,
        imageUrl: uploadedData?.publicUrl || opt.imageUrl || undefined,
        imageFileUploadId: uploadedData?.fileUploadId,
      };
    });

    onSubmit({
      type: "TAG",
      title: data.title,
      description: data.description,
      imageUrl: mainImage.uploadedData?.publicUrl || data.imageUrl || undefined,
      imageFileUploadId: mainImage.uploadedData?.fileUploadId,
      maxSelections: data.maxSelections,
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

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <BaseActionFormFields
          control={form.control}
          isLoading={isLoading}
          titlePlaceholder="예: 관심사를 태그로 선택해주세요."
          mainImagePreviewUrl={mainImage.previewUrl}
          onMainImageSelect={mainImage.selectImage}
          onMainImageDelete={mainImage.clearImage}
        />

        <MaxSelectionsField
          control={form.control}
          name="maxSelections"
          maxOptions={fields.length}
          disabled={isLoading}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              태그 <span className="text-destructive">*</span>
            </Label>
            {form.formState.errors.options?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.options.message}</p>
            )}
          </div>

          {fields.length > 0 ? (
            <div>
              {fields.map((field, index) => {
                const previewUrl = optionImages.getPreviewUrl(
                  field.id,
                  form.watch(`options.${index}.imageUrl`),
                );

                return (
                  <TagFormOptionCard
                    key={field.id}
                    index={index}
                    total={fields.length}
                    minOptions={MIN_OPTIONS}
                    title={form.watch(`options.${index}.title`)}
                    description={form.watch(`options.${index}.description`)}
                    imagePreviewUrl={previewUrl}
                    titlePlaceholder="태그 제목"
                    descriptionPlaceholder="태그 설명 (선택)"
                    onTitleChange={value => {
                      form.setValue(`options.${index}.title`, value, { shouldValidate: true });
                      form.trigger("options");
                    }}
                    onDescriptionChange={value =>
                      form.setValue(`options.${index}.description`, value)
                    }
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    onDelete={() => {
                      optionImages.clearImage(field.id);
                      remove(index);
                    }}
                    onImageSelect={file => optionImages.selectImage(field.id, file)}
                    onImageDelete={() => optionImages.clearImage(field.id)}
                    disabled={isLoading}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
              <p className="text-sm">태그가 없습니다.</p>
              <p className="text-xs mt-1">아래 버튼을 눌러 태그를 추가하세요.</p>
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
            태그 추가
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {isEditMode ? "닫기" : "이전"}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || mainImage.isUploading || optionImages.isAnyUploading}
          >
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
