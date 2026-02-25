"use client";

import CameraIcon from "@public/svgs/camera-icon.svg";
import PolliaFaceVeryGood from "@public/svgs/face/very-good.svg";
import { cn } from "@repo/ui/lib";
import Image from "next/image";
import { useRef, useState } from "react";

const SIZE_VARIANTS = {
  small: { container: "size-6", icon: "size-4" },
  medium: { container: "size-8", icon: "size-5" },
  large: { container: "size-[96px]", icon: "size-[68px]" },
} as const;

interface UserAvatarProps {
  imageUrl?: string | null;
  size: keyof typeof SIZE_VARIANTS;
  className?: string;
  editable?: boolean;
  onImageSelect?: (file: File) => void;
}

export function UserAvatar({
  imageUrl,
  size,
  className,
  editable,
  onImageSelect,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const showFallback = imageError || !imageUrl;
  const { container, icon } = SIZE_VARIANTS[size];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect?.(file);
    }
    e.target.value = "";
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-zinc-200",
          container,
          className,
        )}
      >
        {showFallback ? (
          <div className="flex size-full items-center justify-center">
            <PolliaFaceVeryGood className={cn("text-zinc-500", icon)} />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt="프로필"
            fill
            sizes={size === "large" ? "80px" : size === "medium" ? "32px" : "24px"}
            className="object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      {editable && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "absolute bottom-0 right-0 flex items-center justify-center",
              "size-9 rounded-lg border border-zinc-200 bg-white",
            )}
            aria-label="프로필 사진 변경"
          >
            <CameraIcon className="size-4" />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}
