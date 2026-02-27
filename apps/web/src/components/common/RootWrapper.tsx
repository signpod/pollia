"use client";

import { cn } from "@repo/ui/lib";
import { usePathname } from "next/navigation";

export function RootWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isZincBg = pathname.startsWith("/me/result/") || pathname.match(/^\/mission\/[^/]+\/done$/);

  return (
    <div
      className={cn(
        "mx-auto min-h-svh w-full max-w-[600px] shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]",
        isZincBg ? "bg-zinc-50" : "bg-background",
      )}
    >
      {children}
    </div>
  );
}
