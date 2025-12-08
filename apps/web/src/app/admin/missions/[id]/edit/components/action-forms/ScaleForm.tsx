"use client";

import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { BaseActionFormFields } from "./BaseActionForm";
import { type ScaleFormInput, scaleFormSchema } from "./schemas";
import type { ActionFormProps, ActionOptionInput, ScaleFormData } from "./types";

interface OptionCardProps {
  index: number;
  total: number;
  title: string;
  description?: string;
  imagePreviewUrl?: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onImageSelect: (file: File) => void;
  onImageDelete: () => void;
  disabled?: boolean;
}

function OptionCard({
  index,
  total,
  title,
  description,
  imagePreviewUrl,
  onTitleChange,
  onDescriptionChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onImageSelect,
  onImageDelete,
  disabled,
}: OptionCardProps) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <Card className="mb-3 py-4 px-0">
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-2 items-start">
            <div className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">
              {index + 1}
            </div>

            <ImageSelector
              size="medium"
              imageUrl={imagePreviewUrl}
              onImageSelect={onImageSelect}
              onImageDelete={onImageDelete}
              disabled={disabled}
            />
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            <Input
              placeholder="척도 레이블"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              disabled={disabled}
              className="h-9 text-sm"
            />
            <Input
              placeholder="척도 설명 (선택)"
              value={description || ""}
              onChange={e => onDescriptionChange(e.target.value)}
              disabled={disabled}
              className="h-9 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMoveUp}
              disabled={disabled || isFirst}
              className="size-8"
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMoveDown}
              disabled={disabled || isLast}
              className="size-8"
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={disabled}
            className="size-8 text-destructive hover:text-destructive shrink-0"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScaleForm({
  isLoading = false,
  onSubmit,
  onCancel,
}: ActionFormProps<ScaleFormData>) {
  const form = useForm<ScaleFormInput>({
    resolver: zodResolver(scaleFormSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      options: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove, swap } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const imagePreviewUrls = new Map<string, string>();
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string | null>(null);

  const handleSubmit = form.handleSubmit((data: ScaleFormInput) => {
    const formattedOptions: ActionOptionInput[] = data.options.map(opt => ({
      title: opt.title,
      description: opt.description || undefined,
      imageUrl: opt.imageUrl || undefined,
    }));

    onSubmit({
      type: "SCALE",
      title: data.title,
      description: data.description,
      options: formattedOptions,
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

  const handleImageSelect = (index: number, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    const fieldId = fields[index]?.id;
    if (fieldId) {
      imagePreviewUrls.set(fieldId, previewUrl);
    }
    form.setValue(`options.${index}.imageUrl`, previewUrl);
  };

  const handleImageDelete = (index: number) => {
    const fieldId = fields[index]?.id;
    if (fieldId) {
      const previewUrl = imagePreviewUrls.get(fieldId);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        imagePreviewUrls.delete(fieldId);
      }
    }
    form.setValue(`options.${index}.imageUrl`, undefined);
  };

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
          titlePlaceholder="예: 서비스 만족도를 평가해주세요."
          mainImagePreviewUrl={mainImagePreviewUrl}
          onMainImageSelect={handleMainImageSelect}
          onMainImageDelete={handleMainImageDelete}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              척도 <span className="text-destructive">*</span>
            </Label>
            {form.formState.errors.options?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.options.message}</p>
            )}
          </div>

          {fields.length > 0 ? (
            <div>
              {fields.map((field, index) => (
                <OptionCard
                  key={field.id}
                  index={index}
                  total={fields.length}
                  title={form.watch(`options.${index}.title`)}
                  description={form.watch(`options.${index}.description`)}
                  imagePreviewUrl={form.watch(`options.${index}.imageUrl`)}
                  onTitleChange={value => {
                    form.setValue(`options.${index}.title`, value, { shouldValidate: true });
                    form.trigger("options");
                  }}
                  onDescriptionChange={value =>
                    form.setValue(`options.${index}.description`, value)
                  }
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  onDelete={() => remove(index)}
                  onImageSelect={file => handleImageSelect(index, file)}
                  onImageDelete={() => handleImageDelete(index)}
                  disabled={isLoading}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
              <p className="text-sm">척도가 없습니다.</p>
              <p className="text-xs mt-1">아래 버튼을 눌러 척도를 추가하세요.</p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleAddOption}
            disabled={isLoading}
          >
            <Plus className="size-4 mr-2" />
            척도 추가
          </Button>
        </div>

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
