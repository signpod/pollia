import { cn } from "@/lib/utils";
import Image from "next/image";

interface AdaptiveImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function AdaptiveImage({ src, alt, priority, className }: AdaptiveImageProps) {
  return (
    <figure className={cn("relative overflow-hidden rounded-sm aspect-square", className)}>
      <Image src={src} alt={alt} fill className="object-cover" priority={priority} />
    </figure>
  );
}
