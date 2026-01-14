import { cn } from "@/lib/utils";
import Image from "next/image";

interface MissionLogoProps {
  logoUrl?: string;
  size?: "small" | "default";
}

export function MissionLogo({ logoUrl, size = "default" }: MissionLogoProps) {
  if (!logoUrl) return null;

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden ring-1 ring-zinc-200 bg-white shrink-0",
        size === "small" ? "size-7" : "size-10",
      )}
    >
      <Image src={logoUrl} alt="Mission Logo" fill sizes="100%" className="object-contain" />
    </div>
  );
}
