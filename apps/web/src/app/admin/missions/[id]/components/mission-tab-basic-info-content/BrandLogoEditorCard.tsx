"use client";

import { ImageView } from "@/app/admin/components/common/molecules/viewers";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Pencil } from "lucide-react";
import { useRef } from "react";

interface BrandLogoEditorCardProps {
  imageUrl?: string | null;
  disabled?: boolean;
  onAddFile: (file: File) => void;
  onEdit: () => void;
}

export function BrandLogoEditorCard({
  imageUrl,
  disabled = false,
  onAddFile,
  onEdit,
}: BrandLogoEditorCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasImage = Boolean(imageUrl);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium">브랜드 로고</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => {
              if (hasImage) {
                onEdit();
                return;
              }
              inputRef.current?.click();
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            {hasImage ? "편집" : "이미지 추가"}
          </Button>
        </div>
        <CardDescription>권장 비율 1:1</CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              onAddFile(file);
            }
            e.target.value = "";
          }}
        />
        <ImageView src={imageUrl} alt="브랜드 로고" size="md" />
      </CardContent>
    </Card>
  );
}
