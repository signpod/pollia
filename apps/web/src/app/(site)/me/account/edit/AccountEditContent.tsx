"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ImageCropModal } from "@/components/common/templates/action/image/ImageCropModal";
import { useImageCrop } from "@/components/common/templates/action/image/hooks/useImageCrop";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import { useUpdateUserName } from "@/hooks/user/useUpdateUserName";
import { useUpdateUserProfileImage } from "@/hooks/user/useUpdateUserProfileImage";
import { nameSchema } from "@/schemas/user/userSchema";
import { ButtonV2, Input, Typo } from "@repo/ui/components";
import { Loader2Icon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface AccountEditContentProps {
  userName: string;
}

export function AccountEditContent({ userName }: AccountEditContentProps) {
  const router = useRouter();
  const profileImageUrl = useProfileImageUrl();
  const [name, setName] = useState(userName);
  const { mutateAsync: updateNameAsync, isPending: isNamePending } = useUpdateUserName();
  const { updateProfileImageAsync, isPending: isImagePending } = useUpdateUserProfileImage();

  const [pendingCroppedFile, setPendingCroppedFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const { crop, zoom, rotation, setCrop, setZoom, setRotation, resetCropState, cropImage } =
    useImageCrop();

  const trimmed = name.trim();
  const validation = nameSchema.safeParse(trimmed);
  const isNameChanged = trimmed !== userName;
  const isImageChanged = !!pendingCroppedFile;
  const hasChanges = (isNameChanged && validation.success) || isImageChanged;
  const errorMessage =
    trimmed.length > 0 && !validation.success ? validation.error.issues[0]?.message : undefined;

  const isPending = isNamePending || isImagePending;

  const handleSubmit = async () => {
    if (!hasChanges || isPending) return;

    const promises: Promise<unknown>[] = [];

    if (pendingCroppedFile) {
      promises.push(updateProfileImageAsync(pendingCroppedFile));
      setPendingCroppedFile(null);
    }

    if (isNameChanged && validation.success) {
      promises.push(updateNameAsync(trimmed));
    }

    await Promise.all(promises);
    router.back();
  };

  const handleImageSelect = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setCropImageSrc(url);
      setSelectedFile(file);
      resetCropState();
    },
    [resetCropState],
  );

  const handleCropCancel = useCallback(() => {
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    setSelectedFile(null);
    resetCropState();
  }, [cropImageSrc, resetCropState]);

  const handleCropComplete = useCallback(async () => {
    if (!cropImageSrc || !selectedFile) return;
    const croppedFile = await cropImage(cropImageSrc, selectedFile);

    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    const previewUrl = URL.createObjectURL(croppedFile);
    setPendingCroppedFile(croppedFile);
    setPendingPreviewUrl(previewUrl);

    URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    setSelectedFile(null);
    resetCropState();
  }, [cropImageSrc, selectedFile, cropImage, pendingPreviewUrl, resetCropState]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-12 items-center justify-between bg-white px-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-12 items-center justify-center"
        >
          <XIcon className="size-6" />
        </button>
        <ButtonV2
          variant="tertiary"
          size="medium"
          disabled={!hasChanges || isPending}
          onClick={handleSubmit}
          className="px-4"
        >
          {isPending ? (
            <Loader2Icon className="size-5 animate-spin" />
          ) : (
            <Typo.ButtonText size="medium">완료</Typo.ButtonText>
          )}
        </ButtonV2>
      </header>
      <div className="flex flex-col gap-10 px-5 py-10">
        <div className="flex justify-center">
          <UserAvatar
            size="large"
            imageUrl={pendingPreviewUrl ?? profileImageUrl}
            editable
            onImageSelect={handleImageSelect}
          />
        </div>
        <Input
          label="닉네임"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={10}
          errorMessage={errorMessage}
        />
      </div>

      {cropImageSrc && (
        <ImageCropModal
          isOpen={!!cropImageSrc}
          imageSrc={cropImageSrc}
          cropShape="circle"
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
    </div>
  );
}
