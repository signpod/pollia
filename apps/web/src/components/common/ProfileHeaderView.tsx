"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ROUTES } from "@/constants/routes";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ChevronLeftIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export interface ProfileHeaderViewProps {
  showBack?: boolean;
  fallbackRight?: ReactNode;
  user?: { name: string } | null;
  profileImageUrl?: string | null;
  onBack?: () => void;
  onProfileClick?: () => void;
}

export function ProfileHeaderView({
  showBack = false,
  fallbackRight,
  user,
  profileImageUrl,
  onBack,
  onProfileClick,
}: ProfileHeaderViewProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 grid h-12 grid-cols-[auto_1fr_auto] items-center gap-2 bg-white px-3 sm:px-5",
        showBack && "pl-0",
      )}
    >
      <div className="flex min-w-0 items-center">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="size-12 flex shrink-0 items-center justify-center"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
        ) : (
          <Link href={ROUTES.HOME} className="flex shrink-0 items-center gap-[2.775px] py-3">
            <PolliaIcon className="size-4 text-primary" />
            <PolliaWordmark className="h-[22px] text-black" />
          </Link>
        )}
      </div>

      <div className="flex min-w-0 justify-center">
        <Link
          href={ROUTES.SEARCH}
          className="flex w-[70%] items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 text-left"
        >
          <SearchIcon className="size-4 shrink-0 text-zinc-400" />
          <Typo.Body size="small" className="truncate text-zinc-500">
            검색
          </Typo.Body>
        </Link>
      </div>

      <div className="flex min-w-0 justify-end">
        {user ? (
          <button onClick={onProfileClick} type="button">
            <div className="flex items-center gap-2">
              <UserAvatar size="small" imageUrl={profileImageUrl} />
              <Typo.Body size="medium" className="hidden font-medium text-zinc-700 sm:block">
                {user.name}
              </Typo.Body>
            </div>
          </button>
        ) : (
          fallbackRight
        )}
      </div>
    </header>
  );
}
