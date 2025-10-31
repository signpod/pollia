import { useEffect, useState } from "react";
import { PrimitiveAtom, useAtom, useSetAtom } from "jotai";
import { ImageSelector as ImageSelectorComponent, Typo } from "@repo/ui/components";
import { useImageUpload } from "@/hooks/common/useImageUpload";

interface ImageSelectorSectionProps {
  imageUrlAtom: PrimitiveAtom<string | undefined>;
  imageFileUploadIdAtom: PrimitiveAtom<string | undefined>;
}

export function ImageSelectorSection({
  imageUrlAtom,
  imageFileUploadIdAtom,
}: ImageSelectorSectionProps) {
  const [imageUrl, setImageUrl] = useAtom(imageUrlAtom);
  const setUploadedFileId = useSetAtom(imageFileUploadIdAtom);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [uploadedFile, setUploadedFile] = useState<{
    path: string;
    fileUploadId: string;
  } | null>(null);

  const { upload, isUploading, uploadError, deleteImage, isDeleting } = useImageUpload({
    bucket: "survey-images",
    onSuccess: result => {
      setImageUrl(result.publicUrl);
      setUploadedFileId(result.fileUploadId);

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
      console.error("❌ 썸네일 업로드 실패:", error);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
    },
    onProgress: progress => {
      console.log(`업로드 진행률: ${progress.percentage}%`);
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
    setUploadedFileId(undefined);
    setImageUrl(undefined);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Typo.SubTitle size="large">이미지</Typo.SubTitle>
        </div>
        <span className="text-xs font-medium text-zinc-400">{imageUrl ? "1" : "0"}/1</span>
      </div>

      <ImageSelectorComponent
        size="large"
        imageUrl={imageUrl || previewUrl}
        onImageSelect={handleImageSelect}
        onImageDelete={handleImageDelete}
      />

      {/* TODO: 업로드 상태 표시. 임시로 만들었습니다. */}
      {(isUploading || isDeleting) && (
        <div className="text-sm text-blue-500">{isUploading ? "업로드 중..." : "삭제 중..."}</div>
      )}
      {uploadError && (
        <div className="text-sm text-red-500">업로드 실패: {uploadError.message}</div>
      )}
    </div>
  );
}
