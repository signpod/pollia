"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { cn } from "@/app/admin/lib/utils";
import { FileText, Upload, X } from "lucide-react";
import { useRef } from "react";

export interface PdfUploaderProps {
  fileName?: string;
  fileUrl?: string;
  onFileSelect?: (file: File) => void;
  onFileDelete?: () => void;
  disabled?: boolean;
  className?: string;
  isUploading?: boolean;
}

export function PdfUploader({
  fileName,
  fileUrl,
  onFileSelect,
  onFileDelete,
  disabled = false,
  className,
  isUploading = false,
}: PdfUploaderProps) {
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

  const handleDownload = (e: React.MouseEvent) => {
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
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
        aria-label="PDF 파일 선택"
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
        aria-label={hasFile ? "PDF 파일 변경" : "PDF 파일 선택"}
      >
        <div className="flex w-full items-center gap-3">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-md",
              hasFile ? "bg-primary/10" : "bg-muted",
            )}
          >
            {hasFile ? (
              <FileText className="size-6 text-primary" />
            ) : (
              <Upload className="size-6 text-muted-foreground" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
            {hasFile ? (
              <>
                <p className="w-full truncate text-left text-sm font-medium">{fileName || "파일명 없음"}</p>
                <p className="text-xs text-muted-foreground">PDF • 최대 50MB</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">
                  {isUploading ? "업로드 중..." : "PDF 파일 선택"}
                </p>
                <p className="text-xs text-muted-foreground">PDF • 최대 50MB</p>
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
          aria-label="PDF 파일 삭제"
        >
          <X className="size-3.5" strokeWidth={4} />
        </Button>
      )}

      {hasFile && fileUrl && !isUploading && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          disabled={disabled}
          className="absolute -bottom-2 right-2 h-7 text-xs"
          aria-label="PDF 다운로드"
        >
          미리보기
        </Button>
      )}
    </div>
  );
}
