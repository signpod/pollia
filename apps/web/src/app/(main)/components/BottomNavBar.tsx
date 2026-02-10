"use client";

import { ROUTES } from "@/constants/routes";
import { Heart,  Search } from "lucide-react";
import HomeIcon from "@public/svgs/home-icon.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: ROUTES.HOME, icon: HomeIcon, label: "홈", disabled: false },
  // TODO: 검색 페이지 구현 후 disabled 해제
  { href: "/search", icon: Search, label: "검색", disabled: true },
  // TODO: 좋아요 페이지 구현 후 disabled 해제
  { href: "/likes", icon: Heart, label: "좋아요", disabled: true },
] as const;

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[600px] -translate-x-1/2 items-center justify-between bg-white px-5 py-3 shadow-[0px_-4px_20px_0px_rgba(9,9,11,0.16)]">
      {NAV_ITEMS.map(({ href, icon: Icon, label, disabled }) => {
        const isActive = !disabled && pathname === href;

        if (disabled) {
          return (
            <span
              key={href}
              className="flex flex-1 cursor-not-allowed flex-col items-center justify-center h-12 opacity-30"
              aria-label={label}
              aria-disabled="true"
            >
              <Icon className="size-6 text-disabled" strokeWidth={1.5} />
            </span>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center h-12"
            aria-label={label}
          >
            <Icon
              className={`size-6 ${isActive ? "text-default" : "text-disabled"}`}
              strokeWidth={isActive ? 2 : 1.5}
            />
          </Link>
        );
      })}
    </nav>
  );
}
