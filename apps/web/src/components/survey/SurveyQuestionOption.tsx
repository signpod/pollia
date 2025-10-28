"use client";

import {
  Button,
  ImageSelector,
  Input,
  DrawerContent,
  DrawerHeader,
  DrawerProvider,
  useDrawer,
  IconButton,
} from "@repo/ui/components";
import { EllipsisVertical } from "lucide-react";
import { useImageUpload } from "@/hooks/common/useImageUpload";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

function OptionMenuTrigger() {
  const { open } = useDrawer();

  return (
    <IconButton
      icon={EllipsisVertical}
      iconClassName="text-zinc-400"
      onClick={open}
    />
  );
}

interface OptionMenuContentProps {
  onRemove: () => void;
}

function OptionMenuContent({ onRemove }: OptionMenuContentProps) {
  return (
    <DrawerContent>
      <DrawerHeader>항목 세부 설정</DrawerHeader>

      <div className={cn("flex-1 px-4", "flex flex-col gap-2")}>
        <Button variant="secondary" onClick={onRemove}>
          항목 삭제하기
        </Button>
      </div>
    </DrawerContent>
  );
}

export interface SurveyQuestionOptionProps {
  id: string;
  description: string;
  imageUrl: string;
  fileUploadId: string;
  onDescriptionChange: (description: string) => void;
  onImageUrlChange: (imageUrl: string) => void;
  onFileUploadIdChange: (fileUploadId: string) => void;
  onRemove: () => void;
  placeholder?: string;
}

export function SurveyQuestionOption({
  description,
  imageUrl,
  onDescriptionChange,
  onImageUrlChange,
  onFileUploadIdChange,
  onRemove,
  placeholder = "질문 항목을 입력해주세요",
}: SurveyQuestionOptionProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<{
    path: string;
    fileUploadId: string;
  } | null>(null);

  const { upload, isUploading, uploadError, deleteImage, isDeleting } =
    useImageUpload({
      bucket: "poll-images",
      onSuccess: (result) => {
        onImageUrlChange?.(result.publicUrl);
        onFileUploadIdChange?.(result.fileUploadId);

        setUploadedFile({
          path: result.path,
          fileUploadId: result.fileUploadId,
        });

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl("");
        }
      },
      onError: (error) => {
        console.error("❌ 옵션 이미지 업로드 실패:", error);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl("");
        }
      },
      onProgress: (progress) => {
        console.log(`옵션 이미지 업로드 진행률: ${progress.percentage}%`);
      },
    });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageSelect = (file: File) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    upload(file);
  };

  const handleImageDelete = () => {
    if (uploadedFile) {
      deleteImage({
        path: uploadedFile.path,
        bucket: "poll-images",
      });
    }

    setUploadedFile(null);
    onFileUploadIdChange?.("");
    onImageUrlChange?.("");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDescriptionChange?.(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {/* 이미지 선택기 */}
        <ImageSelector
          size="medium"
          imageUrl={imageUrl || previewUrl}
          onImageSelect={handleImageSelect}
          onImageDelete={handleImageDelete}
        />

        <Input
          value={description}
          onChange={handleDescriptionChange}
          placeholder={placeholder}
          containerClassName="flex-1"
          maxLength={50}
        />

        <DrawerProvider>
          <OptionMenuTrigger />
          <OptionMenuContent onRemove={onRemove} />
        </DrawerProvider>
      </div>

      {(isUploading || isDeleting) && (
        <div className="ml-12 text-sm text-blue-500">
          {isUploading ? "이미지 업로드 중..." : "이미지 삭제 중..."}
        </div>
      )}

      {uploadError && (
        <div className="ml-12 text-sm text-red-500">
          업로드 실패: {uploadError.message}
        </div>
      )}
    </div>
  );
}
