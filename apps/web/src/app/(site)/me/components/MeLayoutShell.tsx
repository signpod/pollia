"use client";

import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ChevronLeftIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { MeHeader } from "./MeHeader";

const SUB_PAGE_HEADERS: Record<string, string> = {
  "/me/in-progress": "참여 중",
  "/me/completed": "참여 완료",
  "/me/rewards/pending": "지급 예정",
  "/me/rewards/paid": "지급 완료",
  "/me/liked": "찜",
};

export function MeLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const subPageTitle = SUB_PAGE_HEADERS[pathname];

  return (
    <div className="flex min-h-screen flex-col">
      {subPageTitle ? (
        <header
          className={cn(
            "sticky top-0 z-50 flex h-12 items-center gap-1 bg-white px-5",
            subPageTitle && "pr-5 pl-0",
          )}
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="size-12 flex items-center justify-center"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <Typo.SubTitle className="text-base">{subPageTitle}</Typo.SubTitle>
        </header>
      ) : (
        <MeHeader />
      )}
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
