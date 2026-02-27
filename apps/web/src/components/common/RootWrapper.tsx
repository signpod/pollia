"use client";

import { cn } from "@repo/ui/lib";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface RootWrapperProps {
  children: ReactNode;
  leftAside?: ReactNode;
  rightAside?: ReactNode;
}

export function RootWrapper({ children, leftAside, rightAside }: RootWrapperProps) {
  const pathname = usePathname();
  const isZincBg = pathname.startsWith("/me/result/") || pathname.match(/^\/mission\/[^/]+\/done$/);

  return (
    <div className="flex min-h-svh justify-center">
      {leftAside && (
        <aside className="hidden min-w-0 shrink overflow-hidden lg:block">
          <div className="sticky top-15 pr-4">{leftAside}</div>
        </aside>
      )}
      <main
        className={cn(
          "w-full max-w-[600px] min-h-svh border-x border-zinc-100 overflow-x-clip shrink-0",
          isZincBg ? "bg-zinc-50" : "bg-background",
        )}
      >
        {children}
      </main>
      {rightAside && (
        <aside className="hidden min-w-0 shrink overflow-hidden lg:block">
          <div className="sticky top-15 pl-4">{rightAside}</div>
        </aside>
      )}
    </div>
  );
}
