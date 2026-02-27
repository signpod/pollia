"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ROUTES } from "@/constants/routes";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
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
      {searchInput && <div className="mx-3 min-w-0 flex-1">{searchInput}</div>}
      {user ? (
        <button onClick={onProfileClick} type="button" className="shrink-0">
          <UserAvatar size="medium" imageUrl={profileImageUrl} />
        </button>
      ) : (
        <div className="shrink-0">{fallbackRight}</div>
      )}
      {searchDropdown}
    </header>
  );
}
