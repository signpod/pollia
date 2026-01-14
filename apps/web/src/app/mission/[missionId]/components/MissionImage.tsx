import { cn } from "@/lib/utils";
import Image from "next/image";

interface MissionImageProps {
  imageUrl: string;
  alt?: string;
  className?: string;
}

export function MissionImage({ imageUrl, alt = "Mission Image", className }: MissionImageProps) {
  if (!imageUrl) return null;

  return (
    <div className={cn("w-full h-full overflow-hidden", className)}>
      <div className="relative w-full h-full">
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover object-top select-none"
          priority
          draggable={false}
          onDragStart={e => e.preventDefault()}
        />
      </div>
    </div>
  );
}
