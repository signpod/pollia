"use client";

import { STORAGE_BUCKETS } from "@/constants/buckets";
import { useImageUpload } from "@/hooks/common/useImageUpload";
import { cn } from "@/lib/utils";
import {
  Button,
  ButtonV2,
  DrawerContent,
  DrawerHeader,
  DrawerProvider,
  IconButton,
  ImageSelector,
  Input,
  Typo,
  useDrawer,
} from "@repo/ui/components";
import { EllipsisVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "../common/Toast";

function OptionMenuTrigger() {
  const { open } = useDrawer();

  return <IconButton icon={EllipsisVertical} iconClassName="text-zinc-400" onClick={open} />;
}

interface OptionMenuContentProps {
  description: string;
  descriptionPlaceholder: string;
  onDescriptionChange: (description: string) => void;
  onRemove: () => void;
}

function OptionMenuContent({
  description,
  descriptionPlaceholder,
  onDescriptionChange,
  onRemove,
}: OptionMenuContentProps) {
  const [tempDescription, setTempDescription] = useState<string>(description);

  const handleSaveDescription = () => {
    onDescriptionChange(tempDescription);
    toast.success("항목 설명이 저장되었습니다");
  };
  return (
    <DrawerContent>
      <DrawerHeader>항목 세부 설정</DrawerHeader>

      <div className="flex flex-col px-4 gap-2 pb-4">
        <Input
          label="항목 설명"
          value={tempDescription}
          onChange={e => setTempDescription(e.target.value)}
          placeholder={descriptionPlaceholder}
          maxLength={50}
        />

        <ButtonV2 variant="primary" onClick={handleSaveDescription} className="w-full">
          <Typo.ButtonText className="w-full text-center">저장하기</Typo.ButtonText>
        </ButtonV2>
      </div>

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
  title: string;
  description: string;
  imageUrl: string;
  fileUploadId: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onImageUrlChange: (imageUrl: string) => void;
  onFileUploadIdChange: (fileUploadId: string) => void;
  onRemove: () => void;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
}

export function SurveyQuestionOption({
  title,
  description,
  imageUrl,
  onTitleChange,
  onDescriptionChange,
  onImageUrlChange,
  onFileUploadIdChange,
  onRemove,
  titlePlaceholder = "질문 제목을 입력해주세요",
  descriptionPlaceholder = "질문 설명을 입력해주세요",
}: SurveyQuestionOptionProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<{
    path: string;
    fileUploadId: string;
  } | null>(null);

  const { upload, isUploading, uploadError, deleteImage, isDeleting } = useImageUpload({
    bucket: STORAGE_BUCKETS.ACTION_OPTION_IMAGES,
    onSuccess: result => {
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
    onError: error => {
      console.error("❌ 옵션 이미지 업로드 실패:", error);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
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
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder={titlePlaceholder}
          containerClassName="flex-1"
          maxLength={50}
        />

        <DrawerProvider>
          <OptionMenuTrigger />
          <OptionMenuContent
            description={description}
            descriptionPlaceholder={descriptionPlaceholder}
            onDescriptionChange={onDescriptionChange}
            onRemove={onRemove}
          />
        </DrawerProvider>
      </div>

      {!!description && (
        <div className="text-sm text-info border border-info rounded-sm p-2">
          <Typo.Body size="small">{description}</Typo.Body>
        </div>
      )}

      {(isUploading || isDeleting) && (
        <div className="ml-12 text-sm text-blue-500">
          {isUploading ? "이미지 업로드 중..." : "이미지 삭제 중..."}
        </div>
      )}

      {uploadError && (
        <div className="ml-12 text-sm text-red-500">업로드 실패: {uploadError.message}</div>
      )}
    </div>
  );
}
