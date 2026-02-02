"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface AdaptiveImageProps {
  src: string;
  alt: string;
}

export function AdaptiveImage({ src, alt }: AdaptiveImageProps) {
  const [aspectClass, setAspectClass] = useState<"aspect-square" | "aspect-3/2">("aspect-3/2");

  return (
    <figure className={cn("relative overflow-hidden rounded-sm", aspectClass)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onLoad={e => {
          const img = e.currentTarget;
          const isPortrait = img.naturalHeight >= img.naturalWidth;
          setAspectClass(isPortrait ? "aspect-square" : "aspect-3/2");
        }}
      />
    </figure>
  );
}
