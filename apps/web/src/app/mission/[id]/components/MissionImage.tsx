import Image from "next/image";

interface MissionImageProps {
  imageUrl: string;
  alt?: string;
}

export function MissionImage({ imageUrl, alt = "Mission Image" }: MissionImageProps) {
  if (!imageUrl) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-sm aspect-[3/2]">
      <Image src={imageUrl} alt={alt} fill className="object-cover" />
    </div>
  );
}
