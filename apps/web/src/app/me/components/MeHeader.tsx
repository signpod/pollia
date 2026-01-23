"use client";

import { useCurrentUser } from "@/hooks/user";
import { UserRole } from "@prisma/client";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { Typo } from "@repo/ui/components";
import { MessageCircleIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";

export function MeHeader() {
  const inquiryUrl = process.env.NEXT_PUBLIC_INQUIRY_URL;
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white/60 backdrop-blur-md px-5 py-3">
      <div className="flex items-center gap-1.5">
        <PolliaIcon className="text-primary size-5" />
        <PolliaWordmark className="h-4 text-black" />
      </div>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-zinc-700"
          >
            <SettingsIcon className="size-4" />
            <Typo.Body size="small">관리자</Typo.Body>
          </Link>
        )}
        {inquiryUrl && (
          <Link
            href={inquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-zinc-700"
          >
            <MessageCircleIcon className="size-4" />
            <Typo.Body size="small">채널 문의</Typo.Body>
          </Link>
        )}
      </div>
    </header>
  );
}
