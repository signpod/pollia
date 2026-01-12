"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { type UploadedImageData, useSingleImage } from "@/app/admin/hooks/admin-image";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BaseActionFormFields } from "./BaseActionForm";
import { type ShortTextFormInput, shortTextFormSchema } from "./schemas";
import type { ActionFormProps, ShortTextFormData } from "./types";

export function ShortTextForm({
  isLoading = false,
  onSubmit,
  onCancel,
  initialData,
}: ActionFormProps<ShortTextFormData>) {
  const isEditMode = !!initialData;

  const form = useForm<ShortTextFormInput>({
    resolver: zodResolver(shortTextFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl,
      imageFileUploadId: initialData?.imageFileUploadId,
      isRequired: initialData?.isRequired ?? true,
    },
    mode: "onChange",
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

  const handleSubmit = form.handleSubmit((data: ShortTextFormInput) => {
    onSubmit({
      type: "SHORT_TEXT",
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || undefined,
      imageFileUploadId: data.imageFileUploadId,
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
          titlePlaceholder="예: 이름을 입력해주세요."
          mainImagePreviewUrl={mainImage.previewUrl}
          onMainImageSelect={mainImage.upload}
          onMainImageDelete={() => {
            mainImage.discard();
            form.setValue("imageUrl", null, { shouldDirty: true });
            form.setValue("imageFileUploadId", null, { shouldDirty: true });
          }}
        />

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
