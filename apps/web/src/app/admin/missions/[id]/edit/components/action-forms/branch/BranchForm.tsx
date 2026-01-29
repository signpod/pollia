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
import { useFieldArray, useForm } from "react-hook-form";
import { BaseActionFormFields } from "../BaseActionForm";
import { BRANCH_OPTIONS_COUNT, type BranchFormInput, branchFormSchema } from "../schemas";
import type { ActionFormProps, ActionOptionInput, BranchFormData } from "../types";
import { BranchOptionCard } from "./BranchOptionCard";

interface BranchOptionFormData {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  fileUploadId: string | null;
  nextActionId: string | null;
}

const createEmptyBranchOption = (): BranchOptionFormData => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  imageUrl: null,
  fileUploadId: null,
  nextActionId: null,
});

export function BranchForm({
  isLoading = false,
  onSubmit,
  onCancel,
  initialData,
}: ActionFormProps<BranchFormData>) {
  const isEditMode = !!initialData;

  const form = useForm<BranchFormInput>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl,
      imageFileUploadId: initialData?.imageFileUploadId,
      isRequired: initialData?.isRequired ?? true,
      options:
        initialData?.options?.length === BRANCH_OPTIONS_COUNT
          ? initialData.options.map(opt => ({
              id: opt.id ?? crypto.randomUUID(),
              title: opt.title,
              description: opt.description || "",
              imageUrl: opt.imageUrl,
              fileUploadId: opt.fileUploadId,
              nextActionId: opt.nextActionId,
            }))
          : [createEmptyBranchOption(), createEmptyBranchOption()],
    },
    mode: "onChange",
  });

  const { fields } = useFieldArray({
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

  const handleSubmit = form.handleSubmit((data: BranchFormInput) => {
    const formattedOptions: ActionOptionInput[] = data.options.map(opt => {
      return {
        id: opt.id,
        title: opt.title,
        description: opt.description || undefined,
        imageUrl: opt.imageUrl,
        fileUploadId: opt.fileUploadId,
        nextActionId: opt.nextActionId,
      };
    });

    onSubmit({
      type: "BRANCH",
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      imageFileUploadId: data.imageFileUploadId,
      options: formattedOptions,
      isRequired: data.isRequired,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <BaseActionFormFields
          control={form.control}
          watch={form.watch}
          isLoading={isLoading}
          titlePlaceholder="예: 다음 경로를 선택해주세요."
          mainImagePreviewUrl={mainImage.previewUrl}
          onMainImageSelect={mainImage.upload}
          onMainImageDelete={() => {
            mainImage.discard();
            form.setValue("imageUrl", null, { shouldDirty: true });
            form.setValue("imageFileUploadId", null, { shouldDirty: true });
          }}
          hideIsRequired={true}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              분기 경로 (2개 고정) <span className="text-destructive">*</span>
            </Label>
            {form.formState.errors.options?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.options.message}</p>
            )}
          </div>

          <div>
            {fields.map((field, index) => {
              const previewUrl =
                optionImages.getPreviewUrl(field.id) ??
                form.watch(`options.${index}.imageUrl`) ??
                undefined;

              return (
                <BranchOptionCard
                  key={field.id}
                  index={index}
                  title={form.watch(`options.${index}.title`)}
                  description={form.watch(`options.${index}.description`)}
                  imagePreviewUrl={previewUrl}
                  titlePlaceholder={`경로 ${index + 1} 제목`}
                  descriptionPlaceholder="경로 설명 (선택)"
                  onTitleChange={value => {
                    form.setValue(`options.${index}.title`, value, { shouldValidate: true });
                    form.trigger("options");
                  }}
                  onDescriptionChange={value =>
                    form.setValue(`options.${index}.description`, value)
                  }
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
