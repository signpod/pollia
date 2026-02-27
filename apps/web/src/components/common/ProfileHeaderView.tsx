"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ROUTES } from "@/constants/routes";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export interface ProfileHeaderViewProps {
  showBack?: boolean;
  fallbackRight?: ReactNode;
  searchInput?: ReactNode;
  searchDropdown?: ReactNode;
  user?: { name: string } | null;
  profileImageUrl?: string | null;
  onBack?: () => void;
  onProfileClick?: () => void;
}

export function ProfileHeaderView({
  showBack = false,
  fallbackRight,
  searchInput,
  searchDropdown,
  user,
  profileImageUrl,
  onBack,
  onProfileClick,
}: ProfileHeaderViewProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-15 items-center justify-between bg-white px-5",
        showBack && "pr-5 pl-0",
      )}
    >
      {showBack ? (
        <button type="button" onClick={onBack} className="size-12 flex items-center justify-center">
          <ChevronLeftIcon className="size-6" />
        </button>
      ) : (
        <Link href={ROUTES.HOME} className="flex shrink-0 items-center gap-[2.775px] py-3">
          <PolliaIcon className="size-4 text-primary" />
          <PolliaWordmark className="h-[22px] text-black" />
        </Link>
      )}
      {searchInput && <div className="mx-3 flex-1">{searchInput}</div>}
      {user ? (
        <div className="flex h-9 items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="flex size-5 items-center justify-center rounded-full bg-violet-500 text-[11px] font-bold text-white">
              P
            </span>
            <Typo.Body size="small" className="font-bold text-violet-700">
              1,200
            </Typo.Body>
          </div>
          <button onClick={onProfileClick} type="button">
            <UserAvatar size="medium" imageUrl={profileImageUrl} />
          </button>
        </div>
      ) : (
        fallbackRight
      )}
      {searchDropdown}
    </header>
  );
}
