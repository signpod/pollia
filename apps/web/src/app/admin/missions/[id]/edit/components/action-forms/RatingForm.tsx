"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BaseActionFormFields } from "./BaseActionForm";
import { type SubjectiveFormInput, subjectiveFormSchema } from "./schemas";
import type { ActionFormProps, RatingFormData } from "./types";

export function RatingForm({
  isLoading = false,
  onSubmit,
  onCancel,
  initialData,
}: ActionFormProps<RatingFormData>) {
  const form = useForm<SubjectiveFormInput>({
    resolver: zodResolver(subjectiveFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
    },
    mode: "onChange",
  });

  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string | null>(
    initialData?.imageUrl || null,
  );

  const handleSubmit = form.handleSubmit((data: SubjectiveFormInput) => {
    onSubmit({
      type: "RATING",
      title: data.title,
      description: data.description,
    });
  });

  const handleMainImageSelect = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setMainImagePreviewUrl(previewUrl);
    form.setValue("imageUrl", previewUrl);
  };

  const handleMainImageDelete = () => {
    if (mainImagePreviewUrl) {
      URL.revokeObjectURL(mainImagePreviewUrl);
      setMainImagePreviewUrl(null);
    }
    form.setValue("imageUrl", "");
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <BaseActionFormFields
          control={form.control}
          isLoading={isLoading}
          titlePlaceholder="예: 이 제품에 대해 별점을 매겨주세요."
          mainImagePreviewUrl={mainImagePreviewUrl}
          onMainImageSelect={handleMainImageSelect}
          onMainImageDelete={handleMainImageDelete}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            이전
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "생성 중..." : "액션 추가"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
