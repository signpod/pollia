"use client";

import { toast } from "@/components/common/Toast";
import { type UploadedImage, useImageUpload } from "@/hooks/common/useImageUpload";
import { cn } from "@/lib/utils";
import { RelatedEntityType } from "@prisma/client";
import { ButtonV2, Typo } from "@repo/ui/components";
import { Edit2, Loader2Icon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function generateBlurDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        const maxSize = 50;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const blurDataURL = canvas.toDataURL("image/jpeg", 0.4);
        resolve(blurDataURL);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ImageUploadProps {
  initialImageUrl?: string;
  onUploadChange?: (hasUploadedImage: boolean, imageUrl?: string) => void;
  actionId: string;
}

export function ImageUpload({ initialImageUrl, onUploadChange, actionId }: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [blurDataURL, setBlurDataURL] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImageUrl && !uploadedImage) {
      setUploadedImage({
        publicUrl: initialImageUrl,
        path: "",
        file: new File([], ""),
        fileUploadId: "",
        isTemporary: false,
      });
      setIsImageLoading(true);
      onUploadChange?.(true, initialImageUrl);
    }
  }, [initialImageUrl, uploadedImage, onUploadChange]);

  const { upload, isUploading, uploadError } = useImageUpload({
    bucket: "mission-images",
    relatedEntityType: RelatedEntityType.ACTION,
    relatedEntityId: actionId,
    onSuccess: result => {
      setUploadedImage(result);
      setIsImageLoading(true);
      onUploadChange?.(true, result.publicUrl);
    },
    onError: () => {
      toast.warning(uploadError?.message || "파일 업로드에 실패했어요.\n다시 시도해주세요.");
      setUploadedImage(null);
      setIsImageLoading(false);
      onUploadChange?.(false, undefined);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(null);
      setIsImageLoading(false);
      try {
        const blur = await generateBlurDataURL(file);
        setBlurDataURL(blur);
      } catch {
        setBlurDataURL(null);
      }
      upload(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full aspect-square relative rounded-sm overflow-hidden">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2Icon className="size-8 animate-spin text-gray-400" />
          </div>
        )}
        {!isUploading && !uploadedImage && (
          <button
            onClick={() => inputRef.current?.click()}
            type="button"
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-3 border border-dashed bg-white border-zinc-300 rounded-sm",
              "hover:bg-zinc-50",
              "transition-colors duration-200 ease-in-out",
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
            className="absolute inset-0 size-full object-cover"
            onLoadingComplete={() => setIsImageLoading(false)}
          />
        )}
        {uploadedImage && !isImageLoading && (
          <ButtonV2
            variant="primary"
            className="absolute top-2 right-2"
            onClick={() => inputRef.current?.click()}
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
