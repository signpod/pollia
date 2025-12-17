import Image from "next/image";

interface MissionLogoProps {
  logoUrl?: string;
}

export function MissionLogo({ logoUrl }: MissionLogoProps) {
  if (!logoUrl) return null;

  return (
    <div className="relative h-10 w-full">
      <Image src={logoUrl} alt="Mission Logo" fill sizes="100%" className="object-contain" />
    </div>
  );
}
