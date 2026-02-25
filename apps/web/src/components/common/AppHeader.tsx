"use client";

import { useCurrentUser } from "@/hooks/user";
import { UserRole } from "@prisma/client";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { MessageCircleIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppHeaderVariant = "default" | "main";

interface NavLink {
  href: string;
  label: string;
}

interface AppHeaderProps {
  variant?: AppHeaderVariant;
  navLinks?: NavLink[];
  showAuth?: boolean;
  showInquiry?: boolean;
  showAdmin?: boolean;
  rightContent?: ReactNode;
}

const defaultNavLinks: NavLink[] = [
  { href: "/", label: "홈" },
  { href: "/surveys", label: "설문조사" },
  { href: "/activity", label: "내 활동" },
];

export function AppHeader({
  variant = "default",
  navLinks = defaultNavLinks,
  showAuth = false,
  showInquiry = true,
  showAdmin = true,
  rightContent,
}: AppHeaderProps) {
  const pathname = usePathname();
  const inquiryUrl = process.env.NEXT_PUBLIC_INQUIRY_URL;
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isLoggedIn = !!currentUser;

  if (variant === "main") {
    return (
      <header className="sticky top-0 z-50 border-b border-default bg-default">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5">
              <PolliaIcon className="size-6 text-primary" />
              <PolliaWordmark className="h-5 text-black" />
            </Link>
            <Typo.Body size="small" className="hidden text-info sm:block">
              세상을 발견하는 재밌는 방법
            </Typo.Body>
          </div>

          <nav className="flex items-center gap-8">
            <div className="hidden gap-6 md:flex">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-default",
                    pathname === link.href ? "text-default" : "text-sub",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {rightContent}
              {showAuth && !isLoggedIn && (
                <Link
                  href="/login"
                  className="flex h-9 items-center px-3 text-sm font-medium text-sub transition-colors hover:text-default"
                >
                  로그인
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white/60 px-5 py-3 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-1.5">
        <PolliaIcon className="size-6 text-primary" />
        <PolliaWordmark className="h-5 text-black" />
      </Link>
      <div className="flex items-center gap-3">
        {rightContent}
        {showAdmin && isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-zinc-700"
          >
            <SettingsIcon className="size-4" />
            <Typo.Body size="small">관리자</Typo.Body>
          </Link>
        )}
        {showInquiry && inquiryUrl && (
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
