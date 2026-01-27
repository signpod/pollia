"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import {
  type UploadedImageData,
  useMultipleImages,
  useSingleImage,
} from "@/app/admin/hooks/admin-image";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { BaseActionFormFields } from "./BaseActionForm";
import { HasOtherField } from "./HasOtherField";
import { MaxSelectionsField } from "./MaxSelectionsField";
import { MultipleChoiceOptionCard } from "./MultipleChoiceOptionCard";
import {
  MULTIPLE_CHOICE_MAX_OPTIONS,
  MULTIPLE_CHOICE_MIN_OPTIONS,
  type MultipleChoiceFormInput,
  multipleChoiceFormSchema,
} from "./schemas";
import type { ActionFormProps, ActionOptionInput, MultipleChoiceFormData } from "./types";

export function MultipleChoiceForm({
  isLoading = false,
  onSubmit,
  onCancel,
  initialData,
}: ActionFormProps<MultipleChoiceFormData>) {
  const isEditMode = !!initialData;

  const form = useForm<MultipleChoiceFormInput>({
    resolver: zodResolver(multipleChoiceFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl,
      imageFileUploadId: initialData?.imageFileUploadId,
      isRequired: initialData?.isRequired ?? true,
      hasOther: initialData?.hasOther ?? false,
      maxSelections: initialData?.maxSelections ?? 1,
      options:
        initialData?.options?.map(opt => ({
          id: opt.id ?? crypto.randomUUID(),
          title: opt.title,
          description: opt.description || "",
          imageUrl: opt.imageUrl,
          fileUploadId: opt.fileUploadId,
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
  const optionImages = useMultipleImages({
    onUploadSuccess: (id: string, data: UploadedImageData) => {
      const index = fields.findIndex(field => field.id === id);
      if (index !== -1) {
        form.setValue(`options.${index}.imageUrl`, data.publicUrl, { shouldDirty: true });
        form.setValue(`options.${index}.fileUploadId`, data.fileUploadId, {
          shouldDirty: true,
        });
      }
    },
  });

  const handleSubmit = form.handleSubmit((data: MultipleChoiceFormInput) => {
    const formattedOptions: ActionOptionInput[] = data.options.map(opt => {
      return {
        id: opt.id,
        title: opt.title,
        description: opt.description || undefined,
        imageUrl: opt.imageUrl,
        fileUploadId: opt.fileUploadId,
      };
    });

    onSubmit({
      type: "MULTIPLE_CHOICE",
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      imageFileUploadId: data.imageFileUploadId,
      maxSelections: data.maxSelections ?? 1,
      hasOther: data.hasOther,
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
          watch={form.watch}
          isLoading={isLoading}
          titlePlaceholder="예: 가장 선호하는 옵션을 선택해주세요."
          mainImagePreviewUrl={mainImage.previewUrl}
          onMainImageSelect={mainImage.upload}
          onMainImageDelete={() => {
            mainImage.discard();
            form.setValue("imageUrl", null, { shouldDirty: true });
            form.setValue("imageFileUploadId", null, { shouldDirty: true });
          }}
        />

        <HasOtherField control={form.control} name="hasOther" disabled={isLoading} />

        <MaxSelectionsField control={form.control} name="maxSelections" disabled={isLoading} />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              선택지 <span className="text-destructive">*</span>
            </Label>
            {form.formState.errors.options?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.options.message}</p>
            )}
          </div>

          {fields.length > 0 ? (
            <div>
              {fields.map((field, index) => {
                const previewUrl =
                  optionImages.getPreviewUrl(field.id) ??
                  form.watch(`options.${index}.imageUrl`) ??
                  undefined;

                return (
                  <MultipleChoiceOptionCard
                    key={field.id}
                    index={index}
                    total={fields.length}
                    minOptions={MULTIPLE_CHOICE_MIN_OPTIONS}
                    title={form.watch(`options.${index}.title`)}
                    description={form.watch(`options.${index}.description`)}
                    imagePreviewUrl={previewUrl}
                    titlePlaceholder="선택지 제목"
                    descriptionPlaceholder="선택지 설명 (선택)"
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
                      optionImages.discard(field.id);
                      remove(index);
                    }}
                    onImageSelect={file => optionImages.upload(field.id, file)}
                    onImageDelete={() => {
                      optionImages.discard(field.id);
                      form.setValue(`options.${index}.imageUrl`, null, {
                        shouldDirty: true,
                      });
                      form.setValue(`options.${index}.fileUploadId`, null, {
                        shouldDirty: true,
                      });
                    }}
                    disabled={isLoading}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
              <p className="text-sm">선택지가 없습니다.</p>
              <p className="text-xs mt-1">아래 버튼을 눌러 선택지를 추가하세요.</p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleAddOption}
            disabled={isLoading || fields.length >= MULTIPLE_CHOICE_MAX_OPTIONS}
          >
            <Plus className="size-4 mr-2" />
            선택지 추가
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
