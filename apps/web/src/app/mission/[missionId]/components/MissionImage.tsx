import Image from "next/image";

interface MissionImageProps {
  imageUrl: string;
  alt?: string;
}

export function MissionImage({ imageUrl, alt = "Mission Image" }: MissionImageProps) {
  if (!imageUrl) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-sm">
      <Image
        src={imageUrl}
        alt={alt}
        width={0}
        height={0}
        sizes="100vw"
        className="w-full h-auto object-contain"
      />
    </div>
  );
}
