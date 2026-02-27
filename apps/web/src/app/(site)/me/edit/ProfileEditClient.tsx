"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ImageCropModal } from "@/components/common/templates/action/image/ImageCropModal";
import { useImageCrop } from "@/components/common/templates/action/image/hooks/useImageCrop";
import { useGoBack } from "@/hooks/common/useGoBack";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import { useUpdateUserName } from "@/hooks/user/useUpdateUserName";
import { useUpdateUserProfileImage } from "@/hooks/user/useUpdateUserProfileImage";
import { nameSchema } from "@/schemas/user/userSchema";
import { Input, Typo } from "@repo/ui/components";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function ProfileEditClient() {
  const goBack = useGoBack();
  const { data: user } = useCurrentUser();
  const profileImageUrl = useProfileImageUrl();
  const { mutate: updateName, isPending: isNamePending } = useUpdateUserName();
  const { updateProfileImage, isPending: isImagePending } = useUpdateUserProfileImage();
  const { crop, zoom, rotation, setCrop, setZoom, setRotation, resetCropState, cropImage } =
    useImageCrop();

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const originalFileRef = useRef<File | null>(null);

  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const currentName = user?.name ?? "";
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const handleImageSelect = useCallback(
    (file: File) => {
      originalFileRef.current = file;
      const objectUrl = URL.createObjectURL(file);
      setCropImageSrc(objectUrl);
      resetCropState();
      setCropModalOpen(true);
    },
    [resetCropState],
  );

  const handleCropCancel = useCallback(() => {
    setCropModalOpen(false);
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    originalFileRef.current = null;
  }, [cropImageSrc]);

  const handleCropComplete = useCallback(async () => {
    if (!cropImageSrc || !originalFileRef.current) return;
    const croppedFile = await cropImage(cropImageSrc, originalFileRef.current);

    setPendingImageFile(croppedFile);
    setLocalPreviewUrl(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(croppedFile);
    });

    setCropModalOpen(false);
    URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    originalFileRef.current = null;
  }, [cropImageSrc, cropImage]);

  const trimmed = name.trim();
  const validation = nameSchema.safeParse(trimmed);
  const isNameChanged = trimmed !== currentName;
  const hasImageChange = pendingImageFile !== null;
  const hasAnyChange = isNameChanged || hasImageChange;
  const nameValid = !isNameChanged || validation.success;
  const isSaving = isNamePending || isImagePending;
  const errorMessage =
    isNameChanged && trimmed.length > 0 && !validation.success
      ? validation.error.issues[0]?.message
      : undefined;

  const handleComplete = () => {
    if (!hasAnyChange || !nameValid) {
      goBack();
      return;
    }

    let pending = 0;
    const onDone = () => {
      pending--;
      if (pending === 0) goBack();
    };

    if (hasImageChange) {
      pending++;
      updateProfileImage(pendingImageFile, { onSuccess: onDone, onError: onDone });
    }

    if (isNameChanged && validation.success) {
      pending++;
      updateName(trimmed, { onSuccess: onDone, onError: onDone });
    }

    if (pending === 0) goBack();
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between bg-white px-3">
        <button type="button" onClick={goBack} className="flex size-12 items-center justify-center">
          <XIcon className="size-6" />
        </button>
        <button type="button" onClick={handleComplete} disabled={isSaving} className="px-3 py-2">
          <Typo.Body size="medium" className="font-semibold text-sub">
            완료
          </Typo.Body>
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center px-5 pt-8">
        <UserAvatar
          size="large"
          imageUrl={localPreviewUrl ?? profileImageUrl}
          editable
          onImageSelect={handleImageSelect}
        />

        <div className="mt-8 flex w-full flex-col gap-2">
          <Typo.SubTitle size="large">닉네임</Typo.SubTitle>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={10}
            showLength={false}
            errorMessage={errorMessage}
          />
        </div>
      </div>

      {cropImageSrc && (
        <ImageCropModal
          isOpen={cropModalOpen}
          imageSrc={cropImageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          cropShape="circle"
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
