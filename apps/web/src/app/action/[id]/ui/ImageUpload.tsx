"use client";

import { toast } from "@/components/common/Toast";
import { type UploadedImage, useImageUpload } from "@/hooks/common/useImageUpload";
import { cn } from "@/lib/utils";
import { RelatedEntityType } from "@prisma/client";
import { ButtonV2, Slider, Typo } from "@repo/ui/components";
import { Dialog, DialogOverlay, DialogPortal } from "@repo/ui/components";
import { Edit2, Loader2Icon, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

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

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", error => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context를 생성할 수 없습니다.");
  }

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(0, 0, bBoxWidth, bBoxHeight);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(data, Math.round(0 - pixelCrop.x), Math.round(0 - pixelCrop.y));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("이미지를 Blob으로 변환하는데 실패했습니다."));
        }
      },
      "image/jpeg",
      0.95,
    );
  });
}

export function ImageUpload({ initialImageUrl, onUploadChange, actionId }: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [blurDataURL, setBlurDataURL] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
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

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (!imageToCrop || !croppedAreaPixels || !originalFile) {
      return;
    }

    try {
      setIsCropModalOpen(false);
      setIsImageLoading(true);

      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels, rotation);
      const croppedFile = new File([croppedBlob], originalFile.name, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      const fileName = croppedFile.name.toLowerCase();
      const fileType = croppedFile.type.toLowerCase();

      const isHeic =
        fileType === "image/heic" ||
        fileType === "image/heif" ||
        fileName.endsWith(".heic") ||
        fileName.endsWith(".heif");

      if (!isHeic && croppedFile.type.startsWith("image/")) {
        try {
          const blur = await generateBlurDataURL(croppedFile);
          setBlurDataURL(blur);
        } catch {
          setBlurDataURL(null);
        }
      } else {
        setBlurDataURL(null);
      }

      upload(croppedFile);

      setImageToCrop(null);
      setOriginalFile(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error("이미지 크롭 실패:", error);
      toast.warning("이미지 처리에 실패했어요.\n다시 시도해주세요.");
      setIsCropModalOpen(false);
      setImageToCrop(null);
      setOriginalFile(null);
    }
  }, [imageToCrop, croppedAreaPixels, rotation, originalFile, upload]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(null);
      setIsImageLoading(false);

      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();

      const isHeic =
        fileType === "image/heic" ||
        fileType === "image/heif" ||
        fileName.endsWith(".heic") ||
        fileName.endsWith(".heif");

      if (isHeic || !file.type.startsWith("image/")) {
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
    }
  };

  const handleCropCancel = () => {
    setIsCropModalOpen(false);
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
    setImageToCrop(null);
    setOriginalFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  };

  useEffect(() => {
    return () => {
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop);
      }
    };
  }, [imageToCrop]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="w-full aspect-square relative rounded-sm overflow-hidden">
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.heic,.heif"
            capture="environment"
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
              onClick={() => {
                inputRef.current?.click();
              }}
              onTouchStart={e => {
                e.preventDefault();
                inputRef.current?.click();
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
              className="absolute inset-0 size-full object-cover"
              onLoadingComplete={() => setIsImageLoading(false)}
            />
          )}
          {uploadedImage && !isImageLoading && (
            <ButtonV2
              variant="primary"
              className="absolute top-2 right-2 touch-manipulation"
              onClick={() => {
                inputRef.current?.click();
              }}
              onTouchStart={e => {
                e.preventDefault();
                inputRef.current?.click();
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

      <Dialog
        open={isCropModalOpen}
        onOpenChange={open => {
          if (!open) {
            handleCropCancel();
          }
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <div className="fixed top-[50%] left-[50%] z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-default shadow-effect-default">
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b border-divider-default p-4">
                <Typo.MainTitle size="small">이미지 편집</Typo.MainTitle>
                <button
                  onClick={handleCropCancel}
                  className="rounded-sm p-1 text-icon-sub transition-colors hover:bg-light touch-manipulation"
                  type="button"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="relative h-[400px] w-full bg-black">
                {imageToCrop && (
                  <Cropper
                    image={imageToCrop}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                    cropShape="rect"
                    showGrid={false}
                  />
                )}
              </div>

              <div className="border-t border-divider-default p-4">
                <div className="mb-4 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Typo.Body size="small" className="w-16 text-sub">
                      확대/축소
                    </Typo.Body>
                    <Slider.Root
                      value={[zoom]}
                      onValueChange={values => setZoom(values[0] ?? 1)}
                      min={1}
                      max={3}
                      step={0.1}
                      className="relative flex h-5 w-full touch-none select-none items-center"
                    >
                      <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-divider-default">
                        <Slider.Range className="absolute h-full bg-primary" />
                      </Slider.Track>
                      <Slider.Thumb className="block size-5 rounded-full border-2 border-white bg-white shadow-effect-default transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" />
                    </Slider.Root>
                    <Typo.Body size="small" className="w-10 shrink-0 text-right text-sub">
                      {Math.round(zoom * 100)}%
                    </Typo.Body>
                  </div>
                  <div className="flex items-center gap-3">
                    <Typo.Body size="small" className="w-16 text-sub">
                      회전
                    </Typo.Body>
                    <Slider.Root
                      value={[rotation]}
                      onValueChange={values => setRotation(values[0] ?? 0)}
                      min={0}
                      max={360}
                      step={1}
                      className="relative flex h-5 w-full touch-none select-none items-center"
                    >
                      <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-divider-default">
                        <Slider.Range className="absolute h-full bg-point" />
                      </Slider.Track>
                      <Slider.Thumb className="block size-5 rounded-full border-2 border-white bg-white shadow-effect-default transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" />
                    </Slider.Root>
                    <Typo.Body size="small" className="w-12 shrink-0 text-right text-sub">
                      {rotation}°
                    </Typo.Body>
                  </div>
                </div>

                <div className="flex gap-3">
                  <ButtonV2
                    variant="secondary"
                    onClick={handleCropCancel}
                    className="flex-1 touch-manipulation"
                  >
                    취소
                  </ButtonV2>
                  <ButtonV2
                    variant="primary"
                    onClick={handleCropComplete}
                    className="flex-1 touch-manipulation"
                  >
                    완료
                  </ButtonV2>
                </div>
              </div>
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    </>
  );
}
