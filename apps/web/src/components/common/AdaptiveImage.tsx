import Image from "next/image";

interface AdaptiveImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function AdaptiveImage({ src, alt, priority }: AdaptiveImageProps) {
  return (
    <figure className="relative overflow-hidden rounded-sm aspect-3/2">
      <Image src={src} alt={alt} fill className="object-cover" priority={priority} />
    </figure>
  );
}
