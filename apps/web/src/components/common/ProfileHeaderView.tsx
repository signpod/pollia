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
        "sticky top-0 z-50 flex h-12 items-center justify-between bg-white px-5",
        showBack && "pr-5 pl-0",
      )}
    >
      {showBack ? (
        <button type="button" onClick={onBack} className="size-12 flex items-center justify-center">
          <ChevronLeftIcon className="size-6" />
        </button>
      ) : (
        <Link href={ROUTES.HOME} className="flex items-center gap-[2.775px] py-3">
          <PolliaIcon className="size-4 text-primary" />
          <PolliaWordmark className="h-[22px] text-black" />
        </Link>
      )}
      {user ? (
        <button onClick={onProfileClick} type="button">
          <div className="flex items-center gap-2">
            <UserAvatar size="small" imageUrl={profileImageUrl} />
            <Typo.Body size="medium" className="font-medium text-zinc-700">
              {user.name}
            </Typo.Body>
          </div>
        </button>
      ) : (
        fallbackRight
      )}
    </header>
  );
}
