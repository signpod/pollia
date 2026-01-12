"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { useAdminSingleImage } from "@/app/admin/hooks/use-admin-image-upload";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BaseActionFormFields } from "./BaseActionForm";
import { MaxSelectionsField } from "./MaxSelectionsField";
import { type ImageUploadFormInput, imageUploadFormSchema } from "./schemas";
import type { ActionFormProps, ImageUploadFormData } from "./types";

export function ImageUploadForm({
  isLoading = false,
  onSubmit,
  onCancel,
  initialData,
}: ActionFormProps<ImageUploadFormData>) {
  const isEditMode = !!initialData;

  const form = useForm<ImageUploadFormInput>({
    resolver: zodResolver(imageUploadFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl,
      imageFileUploadId: initialData?.imageFileUploadId,
      isRequired: initialData?.isRequired ?? true,
      maxSelections: initialData?.maxSelections,
    },
    mode: "onChange",
  });

  const mainImage = useAdminSingleImage({
    initialUrl: initialData?.imageUrl,
    initialFileUploadId: initialData?.imageFileUploadId,
    bucket: STORAGE_BUCKETS.ACTION_IMAGES,
    onUploadSuccess: data => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("imageFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
  });

  const handleSubmit = form.handleSubmit((data: ImageUploadFormInput) => {
    onSubmit({
      type: "IMAGE",
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      imageFileUploadId: data.imageFileUploadId,
      isRequired: data.isRequired,
      maxSelections: data.maxSelections,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <BaseActionFormFields
          control={form.control}
          watch={form.watch}
          isLoading={isLoading}
          titlePlaceholder="예: 사진을 업로드해주세요."
          mainImagePreviewUrl={mainImage.previewUrl}
          onMainImageSelect={mainImage.selectImage}
          onMainImageDelete={() => {
            mainImage.clearImage();
            form.setValue("imageUrl", null, { shouldDirty: true });
            form.setValue("imageFileUploadId", null, { shouldDirty: true });
          }}
        >
          <MaxSelectionsField
            control={form.control}
            name="maxSelections"
            disabled={isLoading}
            isOptional={true}
          />
        </BaseActionFormFields>

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
