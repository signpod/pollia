"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { useAdminSingleImage } from "@/app/admin/hooks/use-admin-image-upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BaseActionFormFields } from "./BaseActionForm";
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
      isRequired: initialData?.isRequired ?? true,
      maxSelections: initialData?.maxSelections,
    },
    mode: "onChange",
  });

  const mainImage = useAdminSingleImage({
    initialUrl: initialData?.imageUrl,
    onUploadSuccess: data => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
    },
  });

  const handleSubmit = form.handleSubmit((data: ImageUploadFormInput) => {
    onSubmit({
      type: "IMAGE",
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || undefined,
      imageFileUploadId: mainImage.uploadedData?.fileUploadId,
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
          onMainImageDelete={mainImage.clearImage}
        >
          <FormField
            control={form.control}
            name="maxSelections"
            render={({ field }) => (
              <FormItem>
                <FormLabel>선택 가능 개수</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    placeholder="1 (기본값)"
                    {...field}
                    value={field.value ?? ""}
                    onChange={e =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  사용자가 선택할 수 있는 이미지 개수입니다. 비워두면 자동으로 1개로 설정됩니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
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
