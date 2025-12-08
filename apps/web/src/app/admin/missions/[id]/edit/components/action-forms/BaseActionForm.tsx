"use client";

import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { Textarea } from "@/app/admin/components/shadcn-ui/textarea";
import type { ReactNode } from "react";
import { useState } from "react";
import type { BaseActionFormData } from "./types";

interface BaseActionFormProps {
  titlePlaceholder?: string;
  isLoading?: boolean;
  onSubmit: (data: BaseActionFormData) => void;
  onCancel: () => void;
  children?: ReactNode;
  isValid?: (baseData: BaseActionFormData) => boolean;
}

export function BaseActionForm({
  titlePlaceholder = "액션 제목을 입력하세요.",
  isLoading = false,
  onSubmit,
  onCancel,
  children,
  isValid: customIsValid,
}: BaseActionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const baseData: BaseActionFormData = {
    title: title.trim(),
    description: description.trim() || undefined,
    imageFile: imageFile || undefined,
  };

  const defaultIsValid = baseData.title.length > 0;
  const isValid = customIsValid ? customIsValid(baseData) && defaultIsValid : defaultIsValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(baseData);
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
  };

  const handleImageDelete = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder={titlePlaceholder}
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          설명 <span className="text-muted-foreground">(선택)</span>
        </Label>
        <Textarea
          id="description"
          placeholder="액션에 대한 추가 설명을 입력하세요."
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={isLoading}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          이미지 <span className="text-muted-foreground">(선택)</span>
        </Label>
        <div className="flex items-center gap-3">
          <ImageSelector
            size="large"
            imageUrl={imagePreviewUrl || undefined}
            onImageSelect={handleImageSelect}
            onImageDelete={handleImageDelete}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">액션에 표시될 이미지를 선택하세요.</p>
        </div>
      </div>

      {children}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          이전
        </Button>
        <Button type="submit" disabled={!isValid || isLoading}>
          {isLoading ? "생성 중..." : "액션 추가"}
        </Button>
      </div>
    </form>
  );
}
