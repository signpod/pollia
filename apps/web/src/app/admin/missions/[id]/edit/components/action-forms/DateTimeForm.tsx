"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { type UploadedImageData, useSingleImage } from "@/app/admin/hooks/admin-image";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BaseActionFormFields } from "./BaseActionForm";
import { MaxSelectionsField } from "./MaxSelectionsField";
import { type DateFormInput, type TimeFormInput, dateFormSchema, timeFormSchema } from "./schemas";
import type { DateFormData, TimeFormData } from "./types";

interface DateTimeFormProps<T extends "DATE" | "TIME"> {
  type: T;
  titlePlaceholder: string;
  isLoading?: boolean;
  onSubmit: (data: T extends "DATE" ? DateFormData : TimeFormData) => void;
  onCancel: () => void;
  initialData?: Partial<Omit<T extends "DATE" ? DateFormData : TimeFormData, "type">>;
}

export function DateTimeForm<T extends "DATE" | "TIME">({
  type,
  titlePlaceholder,
  isLoading = false,
  onSubmit,
  onCancel,
  initialData,
}: DateTimeFormProps<T>) {
  const isEditMode = !!initialData;
  const schema = type === "DATE" ? dateFormSchema : timeFormSchema;

  const form = useForm<DateFormInput | TimeFormInput>({
    resolver: zodResolver(schema),
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

  const mainImage = useSingleImage({
    initialUrl: initialData?.imageUrl,
    initialFileUploadId: initialData?.imageFileUploadId,
    bucket: STORAGE_BUCKETS.ACTION_IMAGES,
    onUploadSuccess: (data: UploadedImageData) => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("imageFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
  });

  const handleSubmit = form.handleSubmit((data: DateFormInput | TimeFormInput) => {
    onSubmit({
      type,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || undefined,
      imageFileUploadId: data.imageFileUploadId,
      isRequired: data.isRequired,
      maxSelections: data.maxSelections,
    } as T extends "DATE" ? DateFormData : TimeFormData);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <BaseActionFormFields
          control={form.control}
          watch={form.watch}
          isLoading={isLoading}
          titlePlaceholder={titlePlaceholder}
          mainImagePreviewUrl={mainImage.previewUrl}
          onMainImageSelect={mainImage.upload}
          onMainImageDelete={() => {
            mainImage.discard();
            form.setValue("imageUrl", null, { shouldDirty: true });
            form.setValue("imageFileUploadId", null, { shouldDirty: true });
          }}
        >
          <MaxSelectionsField control={form.control} name="maxSelections" disabled={isLoading} />
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
