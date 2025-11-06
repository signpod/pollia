import Image from "next/image";

interface SurveyImageProps {
  imageUrl: string;
  alt?: string;
}

export function SurveyImage({ imageUrl, alt = "Survey Image" }: SurveyImageProps) {
  if (!imageUrl) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-sm aspect-[3/2]">
      <Image src={imageUrl} alt={alt} fill className="object-cover" />
    </div>
  );
}
