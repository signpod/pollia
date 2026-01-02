"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { useAdminSingleImage } from "@/app/admin/hooks/use-admin-image-upload";
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
      isRequired: initialData?.isRequired ?? true,
    },
    mode: "onChange",
  });

  const mainImage = useAdminSingleImage({
    initialUrl: initialData?.imageUrl,
    onUploadSuccess: data => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
    },
  });

  const handleSubmit = form.handleSubmit((data: ShortTextFormInput) => {
    onSubmit({
      type: "SHORT_TEXT",
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || undefined,
      imageFileUploadId: mainImage.uploadedData?.fileUploadId,
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
          onMainImageSelect={mainImage.selectImage}
          onMainImageDelete={mainImage.clearImage}
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
