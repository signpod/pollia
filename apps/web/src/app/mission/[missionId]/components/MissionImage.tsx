import Image from "next/image";

interface MissionImageProps {
  imageUrl: string;
  alt?: string;
}

export function MissionImage({ imageUrl, alt = "Mission Image" }: MissionImageProps) {
  if (!imageUrl) return null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover object-top"
        priority
      />
    </div>
  );
}
