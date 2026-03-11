"use client";

import { Footer } from "@/app/(site)/(main)/components/Footer";
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
  const isZincBg = pathname.startsWith("/me/result/");
  const isMissionRoute = pathname.startsWith("/mission");
  const isMissionDone = /^\/mission\/[^/]+\/done/.test(pathname);
  const showFooter = !isMissionRoute || isMissionDone;
  const hasFixedBottom =
    showFooter &&
    !pathname.startsWith("/me") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/preview");

  return (
    <div className="flex min-h-svh justify-center">
      {leftAside && (
        <aside className="hidden min-w-0 shrink overflow-hidden lg:block">
          <div className="sticky top-15 pr-4">{leftAside}</div>
        </aside>
      )}
      <main
        className={cn(
          "flex flex-col w-full max-w-[600px] min-h-svh border-x border-zinc-100 overflow-x-clip shrink-0",
          isZincBg ? "bg-zinc-50" : "bg-background",
        )}
      >
        <div className="flex-1">{children}</div>
        {showFooter && (
          <div className={cn(hasFixedBottom && "pb-20")}>
            <Footer />
          </div>
        )}
      </main>
      {rightAside && (
        <aside className="hidden min-w-0 shrink overflow-hidden lg:block">
          <div className="sticky top-15 pl-4">{rightAside}</div>
        </aside>
      )}
    </div>
  );
}
