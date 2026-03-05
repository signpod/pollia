"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useRef } from "react";
import { ImageView } from "./ImageView";

type ImageViewSize = "sm" | "md" | "lg";

interface ImageEditableViewProps {
  title: string;
  description?: string;
  imageUrl?: string | null;
  imageAlt: string;
  imageSize?: ImageViewSize;
  disabled?: boolean;
  addLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  onAddFile: (file: File) => void;
  onEdit: () => void;
  onDelete?: () => void;
}

export function ImageEditableView({
  title,
  description,
  imageUrl,
  imageAlt,
  imageSize = "md",
  disabled = false,
  addLabel = "이미지 추가",
  editLabel = "편집",
  deleteLabel = "삭제",
  onAddFile,
  onEdit,
  onDelete,
}: ImageEditableViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasImage = Boolean(imageUrl);

  return (
    <div className="h-full rounded-lg border p-3">
      <div className="space-y-2 mb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-medium">{title}</div>
          <div className="flex items-center gap-2">
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
              {hasImage ? editLabel : addLabel}
            </Button>
            {hasImage && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={disabled}
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteLabel}
              </Button>
            ) : null}
          </div>
        </div>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
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
      <div className="text-sm">
        <ImageView src={imageUrl} alt={imageAlt} size={imageSize} />
      </div>
    </div>
  );
}
