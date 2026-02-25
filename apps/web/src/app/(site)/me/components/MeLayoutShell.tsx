"use client";

import { ROUTES } from "@/constants/routes";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ChevronLeftIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface SubPageConfig {
  title: string;
  rightAction?: React.ReactNode;
}

const SUB_PAGE_HEADERS: Record<string, string | SubPageConfig> = {
  [ROUTES.ME_IN_PROGRESS]: "참여 중",
  [ROUTES.ME_COMPLETED]: "참여 완료",
  [ROUTES.ME_REWARDS_PENDING]: "지급 예정",
  [ROUTES.ME_REWARDS_PAID]: "지급 완료",
  [ROUTES.ME_LIKED_TAB]: "찜",
  [ROUTES.ME_ACCOUNT_WITHDRAW]: "회원탈퇴",
  [ROUTES.ME_PARTNERSHIP]: "제휴 문의",
};

function getSubPageConfig(pathname: string): SubPageConfig | null {
  const config = SUB_PAGE_HEADERS[pathname];
  if (!config) return null;
  if (typeof config === "string") return { title: config };
  return config;
}

export function MeLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const subPage = getSubPageConfig(pathname);
  const isMeRoot = pathname === ROUTES.ME;

  return (
    <div className="flex min-h-screen flex-col">
      {subPage && (
        <header className={cn("sticky top-12 z-40 flex h-12 items-center bg-white px-1")}>
          <button
            type="button"
            onClick={() => router.back()}
            className="size-12 flex items-center justify-center"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <Typo.SubTitle className="text-base">{subPage.title}</Typo.SubTitle>
          {subPage.rightAction && <div className="ml-auto h-full">{subPage.rightAction}</div>}
        </header>
      )}
      <div className={cn("flex flex-1 flex-col", isMeRoot && "pt-0")}>{children}</div>
    </div>
  );
}
