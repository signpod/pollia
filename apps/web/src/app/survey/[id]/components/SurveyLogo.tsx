import Image from "next/image";

interface SurveyLogoProps {
  logoUrl?: string;
}

export function SurveyLogo({ logoUrl }: SurveyLogoProps) {
  if (!logoUrl) return null;

  return (
    <div className="relative h-7 w-full">
      <Image src={logoUrl} alt="Survey Logo" fill className="object-contain object-left" />
    </div>
  );
}
