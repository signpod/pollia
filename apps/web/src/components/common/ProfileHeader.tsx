"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/user";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface ProfileHeaderProps {
  showBack?: boolean;
  fallbackRight?: ReactNode;
}

export function ProfileHeader({ showBack = false, fallbackRight }: ProfileHeaderProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-12 items-center justify-between bg-white px-5",
        showBack && "pr-5 pl-0",
      )}
    >
      <div className="flex items-center">
        {showBack && (
          <button
            type="button"
            onClick={() => router.back()}
            className="size-12 flex items-center justify-center"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
        )}
        <Link href={ROUTES.HOME} className="flex items-center gap-[2.775px] py-3">
          <PolliaIcon className="size-4 text-primary" />
          <PolliaWordmark className="h-[22px] text-black" />
        </Link>
      </div>
      {currentUser ? (
        <button onClick={() => router.push(ROUTES.ME)} type="button">
          <div className="flex items-center gap-2">
            <UserAvatar size="small" />
            <Typo.Body size="medium" className="font-medium text-zinc-700">
              {currentUser.name}
            </Typo.Body>
          </div>
        </button>
      ) : (
        fallbackRight
      )}
    </header>
  );
}
