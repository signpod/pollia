"use client";

import { ROUTES } from "@/constants/routes";
import { ButtonV2, Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ChevronLeftIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { MeHeader } from "./MeHeader";

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
  [ROUTES.ME_ACCOUNT]: {
    title: "계정관리",
    rightAction: <AccountRightAction />,
  },
};

const CUSTOM_HEADER_PAGES = new Set<string>([ROUTES.ME_ACCOUNT_EDIT]);

function AccountRightAction() {
  const router = useRouter();
  return (
    <ButtonV2
      variant="tertiary"
      size={null}
      className="flex h-full items-center justify-center px-4"
      onClick={() => router.push(ROUTES.ME_ACCOUNT_EDIT)}
    >
      <Typo.ButtonText size="medium">수정</Typo.ButtonText>
    </ButtonV2>
  );
}

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
  const hasCustomHeader = CUSTOM_HEADER_PAGES.has(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {hasCustomHeader ? null : subPage ? (
        <header className={cn("sticky top-0 z-50 flex h-12 items-center bg-white px-1")}>
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
      ) : (
        <MeHeader />
      )}
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
