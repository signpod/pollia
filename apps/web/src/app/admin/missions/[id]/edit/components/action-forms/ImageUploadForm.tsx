"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { useAdminSingleImage } from "@/app/admin/hooks/use-admin-image-upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BaseActionFormFields } from "./BaseActionForm";
import { type SubjectiveFormInput, subjectiveFormSchema } from "./schemas";
import type { ActionFormProps, ImageUploadFormData } from "./types";

export function ImageUploadForm({
  isLoading = false,
  onSubmit,
  onCancel,
  initialData,
}: ActionFormProps<ImageUploadFormData>) {
  const isEditMode = !!initialData;

  const form = useForm<SubjectiveFormInput>({
    resolver: zodResolver(subjectiveFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl,
    },
    mode: "onChange",
  });

  const mainImage = useAdminSingleImage({ initialUrl: initialData?.imageUrl });

  const handleSubmit = form.handleSubmit((data: SubjectiveFormInput) => {
    onSubmit({
      type: "IMAGE",
      title: data.title,
      description: data.description,
      imageUrl: mainImage.uploadedData?.publicUrl || data.imageUrl || undefined,
      imageFileUploadId: mainImage.uploadedData?.fileUploadId,
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
