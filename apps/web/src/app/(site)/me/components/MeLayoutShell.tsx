"use client";

import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useCanGoBack } from "@/hooks/common/useCanGoBack";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ChevronLeftIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const SUB_PAGE_HEADERS: Record<string, string> = {
  [ROUTES.ME_IN_PROGRESS]: "참여 중",
  [ROUTES.ME_COMPLETED]: "참여 완료",
  [ROUTES.ME_MY_CONTENT]: `내 ${UBIQUITOUS_CONSTANTS.MISSION}`,
  [ROUTES.ME_REWARDS_PENDING]: "지급 예정",
  [ROUTES.ME_REWARDS_PAID]: "지급 완료",
  [ROUTES.ME_LIKED_TAB]: "찜",
  [ROUTES.ME_ACCOUNT_WITHDRAW]: "회원탈퇴",
  [ROUTES.ME_PARTNERSHIP]: "제휴 문의",
};

export function MeLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const hasOwnHeader = pathname === ROUTES.ME_ACCOUNT;
  const subPageTitle =
    SUB_PAGE_HEADERS[pathname] ??
    (pathname.startsWith("/me/result/") ? "결과 다시보기" : undefined);

  return (
    <div className="flex flex-1 flex-col">
      {hasOwnHeader ? null : subPageTitle ? (
        <header className={cn("sticky top-0 z-50 flex h-12 items-center bg-white px-1")}>
          {canGoBack && (
            <button
              type="button"
              onClick={() => router.back()}
              className="size-12 flex items-center justify-center"
            >
              <ChevronLeftIcon className="size-6" />
            </button>
          )}
          <Typo.SubTitle className={cn("text-base", !canGoBack && "pl-4")}>
            {subPageTitle}
          </Typo.SubTitle>
        </header>
      ) : (
        <header className="sticky top-0 z-50 flex h-12 items-center justify-between bg-white px-1">
          {canGoBack ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex size-12 items-center justify-center"
            >
              <ChevronLeftIcon className="size-6" />
            </button>
          ) : (
            <Link href={ROUTES.HOME} className="flex items-center gap-[2.775px] px-3 py-3">
              <PolliaIcon className="size-4 text-primary" />
              <PolliaWordmark className="h-[22px] text-black" />
            </Link>
          )}
          <Link href={ROUTES.ME_ACCOUNT} className="flex size-12 items-center justify-center">
            <SettingsIcon className="size-6" />
          </Link>
        </header>
      )}
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
