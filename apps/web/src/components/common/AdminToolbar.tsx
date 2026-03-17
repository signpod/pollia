"use client";

import { useCurrentUser } from "@/hooks/user";
import { UserRole } from "@prisma/client";
import PollPollE from "@public/svgs/poll-poll-e.svg";
import { Typo } from "@repo/ui/components";
import { ExternalLinkIcon, SettingsIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AdminToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  if (!hasMounted || !isAdmin) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-24 right-4 z-9999 flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-800 px-4 text-white shadow-lg transition-colors hover:bg-zinc-700 active:bg-zinc-900"
        aria-label="관리자 도구 열기"
      >
        {isOpen ? (
          <XIcon className="size-5" />
        ) : (
          <>
            <PollPollE className="size-5" />
            <span className="text-sm font-medium">Admin</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-40 right-4 z-9999 w-72 overflow-hidden rounded-xl border border-default bg-white text-default shadow-2xl">
          <div className="flex items-center justify-between bg-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <PollPollE className="size-5 text-white" />
              <Typo.SubTitle size="large" className="text-white">
                Admin Tools
              </Typo.SubTitle>
            </div>
          </div>

          <div className="flex flex-col">
            <Link
              href="/admin/v2/"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-default transition-colors hover:bg-zinc-50"
              onClick={() => setIsOpen(false)}
            >
              <SettingsIcon className="size-4 text-zinc-500" />
              관리자 페이지
              <ExternalLinkIcon className="ml-auto size-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
