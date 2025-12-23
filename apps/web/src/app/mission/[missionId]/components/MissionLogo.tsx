import Image from "next/image";

interface MissionLogoProps {
  logoUrl?: string;
}

export function MissionLogo({ logoUrl }: MissionLogoProps) {
  if (!logoUrl) return null;

  return (
    <div className="relative size-15 rounded-full overflow-hidden ring-1 ring-zinc-200  bg-white">
      <Image src={logoUrl} alt="Mission Logo" fill sizes="100%" className="object-contain" />
    </div>
  );
}
