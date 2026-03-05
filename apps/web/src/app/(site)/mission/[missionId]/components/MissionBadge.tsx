import { Typo } from "@repo/ui/components";
import type { ReactNode } from "react";

interface MissionBadgeProps {
  icon: ReactNode;
  label: string;
}

export function MissionBadge({ icon, label }: MissionBadgeProps) {
  return (
    <div className="relative flex gap-1 items-center text-white whitespace-nowrap px-3 py-1 rounded-full overflow-hidden">
      <div className="absolute inset-0 bg-white/20 rounded-full" />
      <div
        className="absolute inset-0 backdrop-blur-[100px] rounded-full"
        style={{
          maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
        }}
      />
      <div className="size-4 relative z-10">{icon}</div>
      <Typo.Body size="medium" className="relative z-10">
        {label}
      </Typo.Body>
    </div>
  );
}
