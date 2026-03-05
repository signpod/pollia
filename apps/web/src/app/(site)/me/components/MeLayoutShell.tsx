"use client";

import { ProfileHeader } from "@/components/common/ProfileHeader";
import { ROUTES } from "@/constants/routes";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const SUB_PAGE_HEADERS: Record<string, string> = {
  [ROUTES.ME_IN_PROGRESS]: "참여 중",
  [ROUTES.ME_COMPLETED]: "참여 완료",
  [ROUTES.ME_MY_CONTENT]: "내 콘텐츠",
  [ROUTES.ME_REWARDS_PENDING]: "지급 예정",
  [ROUTES.ME_REWARDS_PAID]: "지급 완료",
  [ROUTES.ME_LIKED_TAB]: "찜",
  [ROUTES.ME_ACCOUNT_WITHDRAW]: "회원탈퇴",
  [ROUTES.ME_PARTNERSHIP]: "제휴 문의",
};

export function MeLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hasOwnHeader = pathname === ROUTES.ME_ACCOUNT;
  const subPageTitle =
    SUB_PAGE_HEADERS[pathname] ??
    (pathname.startsWith("/me/result/") ? "결과 다시보기" : undefined);

  return (
    <div className="flex min-h-screen flex-col">
      {hasOwnHeader ? null : subPageTitle ? (
        <header className={cn("sticky top-0 z-50 flex h-12 items-center bg-white px-1")}>
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
        <ProfileHeader />
      )}
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
