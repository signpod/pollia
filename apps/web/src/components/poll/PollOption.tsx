"use client";

import { useImageUpload } from "@/hooks/common/useImageUpload";
import { cn } from "@/lib/utils";
import {
  Button,
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

function OptionMenuTrigger() {
  const { open } = useDrawer();

  return <IconButton icon={EllipsisVertical} iconClassName="text-zinc-400" onClick={open} />;
}

interface OptionMenuContentProps {
  link: string;
  onLinkChange: (link: string) => void;
  onRemove: () => void;
}

function OptionMenuContent({ link, onLinkChange, onRemove }: OptionMenuContentProps) {
  const [tempLink, setTempLink] = useState<string>(link);
  const { close } = useDrawer();

  const handleLinkSubmit = () => {
    onLinkChange?.(tempLink);
    close();
  };

  const isDisabled = link === tempLink || tempLink.trim() === "";

  return (
    <DrawerContent>
      <DrawerHeader>항목 세부 설정</DrawerHeader>

      <div className={cn("flex-1 px-4", "flex flex-col gap-2")}>
        <Input
          value={tempLink}
          onChange={e => setTempLink(e.target.value)}
          placeholder={"https://www.pollia.me"}
          containerClassName="flex-1"
          maxLength={50}
        />
        <Button variant="primary" onClick={handleLinkSubmit} disabled={isDisabled}>
          항목 추가하기
        </Button>

        <Button variant="secondary" onClick={onRemove}>
          항목 삭제하기
        </Button>
      </div>
    </DrawerContent>
  );
}

export interface PollOptionProps {
  id: string;
  description: string;
  imageUrl: string;
  link: string;
  fileUploadId: string;
  onDescriptionChange: (description: string) => void;
  onImageUrlChange: (imageUrl: string) => void;
  onLinkChange: (link: string) => void;
  onFileUploadIdChange: (fileUploadId: string) => void;
  onRemove: () => void;
  placeholder?: string;
}

export default function PollOption({
  description,
  imageUrl,
  link,
  onDescriptionChange,
  onImageUrlChange,
  onLinkChange,
  onFileUploadIdChange,
  onRemove,
  placeholder = "투표 항목을 입력해주세요",
}: PollOptionProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<{
    path: string;
    fileUploadId: string;
  } | null>(null);

  const { upload, isUploading, uploadError, deleteImage, isDeleting } = useImageUpload({
    bucket: "poll-images",
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
    onProgress: progress => {
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
          <OptionMenuContent link={link} onLinkChange={onLinkChange} onRemove={onRemove} />
        </DrawerProvider>
      </div>

      {link !== undefined && link && (
        <div className="rounded-sm bg-zinc-50 px-4 py-2">
          <Typo.Body size="small">{link}</Typo.Body>
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
