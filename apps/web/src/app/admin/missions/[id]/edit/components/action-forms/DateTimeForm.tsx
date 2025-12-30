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
import { type DateFormInput, type TimeFormInput, dateFormSchema, timeFormSchema } from "./schemas";
import type { DateFormData, TimeFormData } from "./types";

interface DateTimeFormProps<T extends "DATE" | "TIME"> {
  type: T;
  titlePlaceholder: string;
  selectionDescription: string;
  isLoading?: boolean;
  onSubmit: (data: T extends "DATE" ? DateFormData : TimeFormData) => void;
  onCancel: () => void;
  initialData?: Partial<Omit<T extends "DATE" ? DateFormData : TimeFormData, "type">>;
}

export function DateTimeForm<T extends "DATE" | "TIME">({
  type,
  titlePlaceholder,
  selectionDescription,
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
      isRequired: initialData?.isRequired ?? true,
      maxSelections: initialData?.maxSelections || 1,
    },
    mode: "onChange",
  });

  const mainImage = useAdminSingleImage({
    initialUrl: initialData?.imageUrl,
    onUploadSuccess: data => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
    },
  });

  const handleSubmit = form.handleSubmit((data: DateFormInput | TimeFormInput) => {
    onSubmit({
      type,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || undefined,
      imageFileUploadId: mainImage.uploadedData?.fileUploadId,
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
          onMainImageSelect={mainImage.selectImage}
          onMainImageDelete={mainImage.clearImage}
        >
          <FormField
            control={form.control}
            name="maxSelections"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  선택 가능 개수 <span className="text-muted-foreground">(선택)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    {...field}
                    value={field.value || ""}
                    onChange={e =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>{selectionDescription}</FormDescription>
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
