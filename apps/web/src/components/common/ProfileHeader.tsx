"use client";

import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/user";
import PolliaFaceGood from "@public/svgs/face/good.svg";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { ButtonV2, Typo } from "@repo/ui/components";
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
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between bg-white px-5">
      <div className="flex items-center gap-1">
        {showBack && (
          <button type="button" onClick={() => router.back()} className="text-zinc-600">
            <ChevronLeftIcon className="size-5" />
          </button>
        )}
        <Link href={ROUTES.HOME} className="flex items-center gap-[2.775px] py-3">
          <PolliaIcon className="size-4 text-primary" />
          <PolliaWordmark className="h-[22px] text-black" />
        </Link>
      </div>
      {currentUser ? (
        <button onClick={() => router.push(ROUTES.ME)}>
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-violet-100">
              <PolliaFaceGood className="size-4 text-violet-300" />
            </div>
            <Typo.Body size="small" className="font-medium text-zinc-700">
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
