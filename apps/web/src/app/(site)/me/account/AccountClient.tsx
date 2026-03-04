"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ImageCropModal } from "@/components/common/templates/action/image/ImageCropModal";
import { useImageCrop } from "@/components/common/templates/action/image/hooks/useImageCrop";
import { ROUTES } from "@/constants/routes";
import { useGoBack } from "@/hooks/common/useGoBack";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import { useUpdateUserName } from "@/hooks/user/useUpdateUserName";
import { useUpdateUserProfileImage } from "@/hooks/user/useUpdateUserProfileImage";
import { nameSchema } from "@/schemas/user/userSchema";
import { Input, Typo } from "@repo/ui/components";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Typo.Body size="medium" className="text-sub">
        {label}
      </Typo.Body>
      <Typo.Body size="large">{value}</Typo.Body>
    </div>
  );
}

export function AccountClient() {
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

    updateProfileImage(croppedFile);

    setCropModalOpen(false);
    URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    originalFileRef.current = null;
  }, [cropImageSrc, cropImage, updateProfileImage]);

  const trimmed = name.trim();
  const validation = nameSchema.safeParse(trimmed);
  const isNameChanged = trimmed !== currentName;
  const nameValid = !isNameChanged || validation.success;
  const isSaving = isNamePending || isImagePending;
  const errorMessage =
    isNameChanged && trimmed.length > 0 && !validation.success
      ? validation.error.issues[0]?.message
      : undefined;

  const handleNameSubmit = () => {
    if (!isNameChanged || !validation.success || isSaving) return;
    updateName(trimmed);
  };

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return "-";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center bg-white px-1">
        <button type="button" onClick={goBack} className="flex size-12 items-center justify-center">
          <ChevronLeftIcon className="size-6" />
        </button>
        <Typo.SubTitle size="large">계정관리</Typo.SubTitle>
      </header>

      <div className="flex flex-col gap-8 px-5 pt-10">
        <div className="flex justify-center">
          <UserAvatar
            size="large"
            imageUrl={localPreviewUrl ?? profileImageUrl}
            editable
            onImageSelect={handleImageSelect}
          />
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <Typo.Body size="medium" className="text-sub">
              닉네임
            </Typo.Body>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={10}
                  showLength={false}
                  errorMessage={errorMessage}
                />
              </div>
              <button
                type="button"
                onClick={handleNameSubmit}
                disabled={!isNameChanged || !nameValid || isSaving}
                className="h-11 shrink-0 rounded-lg px-4 disabled:text-disabled"
              >
                <Typo.Body size="medium" className="text-sub">
                  수정
                </Typo.Body>
              </button>
            </div>
          </div>

          <InfoField label="휴대폰 번호" value={formatPhone(user?.phone)} />
          <InfoField label="연결된 카카오 계정" value={user?.email ?? "-"} />

          <Link href={ROUTES.ME_ACCOUNT_WITHDRAW}>
            <Typo.Body size="medium" className="font-bold text-zinc-400">
              회원탈퇴
            </Typo.Body>
          </Link>
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
