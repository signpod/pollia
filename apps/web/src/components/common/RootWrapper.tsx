"use client";

import { cn } from "@repo/ui/lib";
import { usePathname } from "next/navigation";

export function RootWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMainPage = pathname === "/";

  return (
    <div className={cn("mx-auto min-h-svh bg-background", !isMainPage && "max-w-lg")}>
      {children}
    </div>
  );
}
