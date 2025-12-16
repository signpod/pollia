"use client";

import { toast } from "@/components/common/Toast";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { type UploadedImage, useImageUpload } from "@/hooks/common/useImageUpload";
import { shouldSkipCrop } from "@/lib/fileValidation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageCropModal } from "./components/ImageCropModal";
import { ImageUploadArea } from "./components/ImageUploadArea";
import { useBlurThumbnail } from "./hooks/useBlurThumbnail";
import { useImageCrop } from "./hooks/useImageCrop";

interface ImageUploadProps {
  initialImageUrl?: string;
  onUploadChange?: (hasUploadedImage: boolean, imageUrl?: string, fileUploadId?: string) => void;
}

export function ImageUpload({ initialImageUrl, onUploadChange }: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { blurDataURL, generateBlur, clearBlur } = useBlurThumbnail();
  const { crop, zoom, rotation, setCrop, setZoom, setRotation, resetCropState, cropImage } =
    useImageCrop();

  const revokeImageUrl = useCallback((url: string | null) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }, []);

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
    bucket: STORAGE_BUCKETS.ACTION_ANSWER_IMAGES,
    onSuccess: result => {
      setUploadedImage(result);
      setIsImageLoading(true);
      onUploadChange?.(true, result.publicUrl, result.fileUploadId);
    },
    onError: () => {
      toast.warning(uploadError?.message || "파일 업로드에 실패했어요.\n다시 시도해주세요.");
      setUploadedImage(null);
      setIsImageLoading(false);
      onUploadChange?.(false, undefined, undefined);
    },
  });

  const handleCropCancel = useCallback(() => {
    setIsCropModalOpen(false);
    revokeImageUrl(imageToCrop);
    setImageToCrop(null);
    setOriginalFile(null);
    resetCropState();
  }, [imageToCrop, revokeImageUrl, resetCropState]);

  const handleCropComplete = useCallback(async () => {
    if (!imageToCrop || !originalFile) {
      return;
    }

    try {
      setIsCropModalOpen(false);
      setIsImageLoading(true);

      const croppedFile = await cropImage(imageToCrop, originalFile);
      await generateBlur(croppedFile);
      upload(croppedFile);

      revokeImageUrl(imageToCrop);
      setImageToCrop(null);
      setOriginalFile(null);
      resetCropState();
    } catch (error) {
      console.error("이미지 크롭 실패:", error);
      toast.warning("이미지 처리에 실패했어요.\n다시 시도해주세요.");
      handleCropCancel();
    }
  }, [
    imageToCrop,
    originalFile,
    cropImage,
    generateBlur,
    upload,
    revokeImageUrl,
    resetCropState,
    handleCropCancel,
  ]);

  const handleFileSelect = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      setUploadedImage(null);
      setIsImageLoading(false);
      clearBlur();

      if (shouldSkipCrop(file)) {
        upload(file);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setImageToCrop(imageUrl);
      setOriginalFile(file);
      setIsCropModalOpen(true);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [upload, clearBlur],
  );

  useEffect(() => {
    return () => {
      revokeImageUrl(imageToCrop);
    };
  }, [imageToCrop, revokeImageUrl]);

  return (
    <>
      <ImageUploadArea
        inputRef={inputRef}
        isUploading={isUploading}
        uploadedImage={uploadedImage}
        isImageLoading={isImageLoading}
        blurDataURL={blurDataURL}
        onFileSelect={handleFileSelect}
        onFileChange={handleFileChange}
        onImageLoadComplete={() => setIsImageLoading(false)}
      />
      {imageToCrop && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          imageSrc={imageToCrop}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCancel={handleCropCancel}
          onComplete={handleCropComplete}
        />
      )}
    </>
  );
}
