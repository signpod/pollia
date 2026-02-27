"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ImageCropModal } from "@/components/common/templates/action/image/ImageCropModal";
import { useImageCrop } from "@/components/common/templates/action/image/hooks/useImageCrop";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import { useUpdateUserName } from "@/hooks/user/useUpdateUserName";
import { useUpdateUserProfileImage } from "@/hooks/user/useUpdateUserProfileImage";
import { nameSchema } from "@/schemas/user/userSchema";
import { ButtonV2, Input, Typo } from "@repo/ui/components";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export function ProfileSection() {
  const { data: user } = useCurrentUser();
  const profileImageUrl = useProfileImageUrl();
  const { mutate: updateName, isPending } = useUpdateUserName();
  const { updateProfileImage, previewUrl } = useUpdateUserProfileImage();
  const { crop, zoom, rotation, setCrop, setZoom, setRotation, resetCropState, cropImage } =
    useImageCrop();

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const originalFileRef = useRef<File | null>(null);

  const currentName = user?.name ?? "";
  const currentEmail = user?.email ?? "";

  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

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
    updateProfileImage(croppedFile);
    setCropModalOpen(false);
    URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    originalFileRef.current = null;
  }, [cropImageSrc, cropImage, updateProfileImage]);

  const trimmed = name.trim();
  const validation = nameSchema.safeParse(trimmed);
  const isChanged = trimmed !== currentName;
  const canSave = isChanged && validation.success && !isPending;
  const errorMessage =
    isChanged && trimmed.length > 0 && !validation.success
      ? validation.error.issues[0]?.message
      : undefined;

  const handleSave = () => {
    if (!canSave) return;
    updateName(trimmed);
  };

  return (
    <section className="flex flex-col gap-4 px-5">
      <Typo.SubTitle size="large">나의 정보</Typo.SubTitle>
      <section className="grid grid-cols-3 items-center ">
        <div className="flex justify-center">
          <UserAvatar
            size="large"
            imageUrl={previewUrl ?? profileImageUrl}
            editable
            onImageSelect={handleImageSelect}
          />
        </div>
        <div className="col-span-2 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={10}
              showLength={false}
              errorMessage={errorMessage}
              containerClassName="min-w-0 flex-1"
            />
            <ButtonV2
              variant="primary"
              size="medium"
              disabled={!canSave}
              onClick={handleSave}
              className="shrink-0 h-12"
            >
              <Typo.ButtonText size="medium">저장</Typo.ButtonText>
            </ButtonV2>
          </div>
          <div className="flex flex-col gap-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <Typo.Body size="small" className="text-sub truncate">
                {currentEmail}
              </Typo.Body>
              <Typo.Body size="small" className="text-zinc-300">
                ·
              </Typo.Body>
              <span className="flex shrink-0 items-center gap-1">
                <Image src="/svgs/kakao-icon.svg" alt="" width={10} height={10} />
                <Typo.Body size="small" className="text-sub">
                  카카오
                </Typo.Body>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex size-[18px] items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                P
              </span>
              <Typo.Body size="small" className="font-semibold text-violet-600">
                1,200 포인트
              </Typo.Body>
            </div>
          </div>
        </div>
      </section>

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
    </section>
  );
}
