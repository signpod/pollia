"use client";

import { type UploadedImage } from "@/hooks/common/useImageUpload";
import { cn } from "@/lib/utils";
import { ButtonV2, Typo } from "@repo/ui/components";
import { Edit2, Loader2Icon, PlusIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadAreaProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  uploadedImage: UploadedImage | null;
  isImageLoading: boolean;
  blurDataURL: string | null;
  onFileSelect: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageLoadComplete: () => void;
}

export function ImageUploadArea({
  inputRef,
  isUploading,
  uploadedImage,
  isImageLoading,
  blurDataURL,
  onFileSelect,
  onFileChange,
  onImageLoadComplete,
}: ImageUploadAreaProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full aspect-square relative rounded-sm overflow-hidden">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          className="hidden"
          onChange={onFileChange}
          disabled={isUploading}
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
            <Loader2Icon className="size-8 animate-spin text-white" />
          </div>
        )}
        {!isUploading && !uploadedImage && (
          <button
            onClick={onFileSelect}
            onTouchStart={e => {
              e.preventDefault();
              onFileSelect();
            }}
            type="button"
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-3 border border-dashed bg-white border-zinc-300 rounded-sm",
              "hover:bg-zinc-50 active:bg-zinc-100",
              "transition-colors duration-200 ease-in-out",
              "touch-manipulation",
            )}
          >
            <PlusIcon className="size-6 text-info" />
            <Typo.ButtonText size="large" className="text-info">
              사진 추가하기
            </Typo.ButtonText>
          </button>
        )}
        {uploadedImage && (
          <Image
            src={uploadedImage.publicUrl}
            alt="uploaded image"
            width={400}
            height={400}
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL || undefined}
            className="absolute inset-0 size-full object-contain"
            onLoadingComplete={onImageLoadComplete}
          />
        )}
        {uploadedImage && !isImageLoading && (
          <ButtonV2
            variant="primary"
            className="absolute top-2 right-2 touch-manipulation"
            onClick={onFileSelect}
            onTouchStart={e => {
              e.preventDefault();
              onFileSelect();
            }}
          >
            <Edit2 className="size-4" />
          </ButtonV2>
        )}
      </div>
      <Typo.Body size="small" className="text-disabled">
        파일 1개당 크기는 최대 5MB를 초과할 수 없습니다.
        <br />
        이미지 유형의 파일만 업로드할 수 있습니다.
      </Typo.Body>
    </div>
  );
}
