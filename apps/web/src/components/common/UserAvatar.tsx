"use client";

import PolliaFaceVeryGood from "@public/svgs/face/very-good.svg";
import { cn } from "@repo/ui/lib";
import Image from "next/image";
import { useState } from "react";

const SIZE_VARIANTS = {
  small: { container: "size-6", icon: "size-4" },
  large: { container: "size-[96px]", icon: "size-[68px]" },
} as const;

interface UserAvatarProps {
  imageUrl?: string | null;
  size: keyof typeof SIZE_VARIANTS;
  className?: string;
}

export function UserAvatar({ imageUrl, size, className }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !imageUrl;
  const { container, icon } = SIZE_VARIANTS[size];

  return (
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
          sizes={size === "large" ? "80px" : "24px"}
          className="object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}
