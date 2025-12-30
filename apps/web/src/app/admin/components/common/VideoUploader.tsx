"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { cn } from "@/app/admin/lib/utils";
import { Play, Upload, Video, X } from "lucide-react";
import { useRef } from "react";

export interface VideoUploaderProps {
  fileName?: string;
  fileUrl?: string;
  onFileSelect?: (file: File) => void;
  onFileDelete?: () => void;
  disabled?: boolean;
  className?: string;
  isUploading?: boolean;
}

export function VideoUploader({
  fileName,
  fileUrl,
  onFileSelect,
  onFileDelete,
  disabled = false,
  className,
  isUploading = false,
}: VideoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFile = !!(fileName || fileUrl);

  const handleClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    e.target.value = "";
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isUploading) return;
    onFileDelete?.();
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.webm,.mov,.avi,video/mp4,video/webm,video/quicktime,video/x-msvideo"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
        aria-label="동영상 파일 선택"
      />

      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className={cn(
          "relative h-24 w-full overflow-hidden rounded-md p-4",
          !hasFile && "bg-muted hover:bg-muted/80",
          hasFile && "border-primary/50 bg-primary/5",
        )}
        aria-label={hasFile ? "동영상 파일 변경" : "동영상 파일 선택"}
      >
        <div className="flex w-full items-center gap-3">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-md",
              hasFile ? "bg-primary/10" : "bg-muted",
            )}
          >
            {hasFile ? (
              <Video className="size-6 text-primary" />
            ) : (
              <Upload className="size-6 text-muted-foreground" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
            {hasFile ? (
              <>
                <p className="w-full truncate text-left text-sm font-medium">
                  {fileName || "파일명 없음"}
                </p>
                <p className="text-xs text-muted-foreground">Video • 최대 50MB</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">
                  {isUploading ? "업로드 중..." : "동영상 파일 선택"}
                </p>
                <p className="text-xs text-muted-foreground">MP4, WebM, MOV, AVI • 최대 50MB</p>
              </>
            )}
          </div>
        </div>
      </Button>

      {hasFile && onFileDelete && !isUploading && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={handleDelete}
          disabled={disabled}
          className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full"
          aria-label="동영상 파일 삭제"
        >
          <X className="size-3.5" strokeWidth={4} />
        </Button>
      )}

      {hasFile && fileUrl && !isUploading && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handlePreview}
          disabled={disabled}
          className="absolute -bottom-2 right-2 flex h-7 items-center gap-1 text-xs"
          aria-label="동영상 재생"
        >
          <Play className="size-3" />
          재생
        </Button>
      )}
    </div>
  );
}
