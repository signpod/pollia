"use client";

import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ChevronLeftIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";
import { MeHeader } from "./MeHeader";

const SUB_PAGE_HEADERS: Record<string, string> = {
  "/me/in-progress": "참여 중",
  "/me/completed": "참여 완료",
  "/me/rewards/pending": "지급 예정",
  "/me/rewards/paid": "지급 완료",
  "/me/liked": "찜",
  "/me/account": "계정관리",
};

const CUSTOM_HEADER_PAGES = new Set(["/me/account/edit"]);

const HeaderRightActionContext = createContext<(node: React.ReactNode) => void>(() => {});

export function useHeaderRightAction() {
  return useContext(HeaderRightActionContext);
}

export function MeLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const subPageTitle = SUB_PAGE_HEADERS[pathname];
  const hasCustomHeader = CUSTOM_HEADER_PAGES.has(pathname);
  const [rightAction, setRightAction] = useState<React.ReactNode>(null);

  const setAction = useCallback((node: React.ReactNode) => {
    setRightAction(node);
  }, []);

  return (
    <HeaderRightActionContext.Provider value={setAction}>
      <div className="flex min-h-screen flex-col">
        {hasCustomHeader ? null : subPageTitle ? (
          <header className={cn("sticky top-0 z-50 flex h-12 items-center bg-white px-1")}>
            <button
              type="button"
              onClick={() => router.back()}
              className="size-12 flex items-center justify-center"
            >
              <ChevronLeftIcon className="size-6" />
            </button>
            <Typo.SubTitle className="text-base">{subPageTitle}</Typo.SubTitle>
            {rightAction && <div className="ml-auto">{rightAction}</div>}
          </header>
        ) : (
          <MeHeader />
        )}
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </HeaderRightActionContext.Provider>
  );
}
