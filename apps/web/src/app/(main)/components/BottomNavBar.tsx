"use client";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/user";
import HomeIcon from "@public/svgs/home-icon.svg";
import { Tooltip, Typo, useDrawer } from "@repo/ui/components";
import { Heart, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginDrawer } from "./LoginDrawer";

export function BottomNavBar() {
  return (
    <LoginDrawer>
      <BottomNavBarContent />
    </LoginDrawer>
  );
}

function BottomNavBarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { open: openLoginDrawer } = useDrawer();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    router.prefetch(ROUTES.LIKES);
  }, [router]);

  const handleLikesClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      openLoginDrawer();
    }
  };

  return (
    <nav className="mx-5 flex items-center justify-between rounded-full bg-white shadow-[0px_4px_20px_0px_rgba(9,9,11,0.16)]">
      <Link
        href={ROUTES.HOME}
        className="flex flex-1 flex-col items-center justify-center h-12"
        aria-label="홈"
      >
        <HomeIcon
          className={`size-5 ${pathname === ROUTES.HOME ? "text-default" : "text-disabled"}`}
          strokeWidth={pathname === ROUTES.HOME ? 2 : 1.5}
        />
      </Link>

      <span
        data-tooltip-id="nav-search"
        className="flex flex-1 cursor-not-allowed flex-col items-center justify-center h-12 opacity-30"
        aria-label="검색"
        aria-disabled="true"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(prev => !prev)}
      >
        <Search className="size-5 text-disabled" strokeWidth={1.5} />
      </span>

      <Link
        href={ROUTES.LIKES}
        className="flex flex-1 flex-col items-center justify-center h-12"
        aria-label="좋아요"
        onClick={handleLikesClick}
      >
        <Heart
          className={`size-5 ${pathname === ROUTES.LIKES ? "text-default" : "text-disabled"}`}
          strokeWidth={pathname === ROUTES.LIKES ? 2 : 1.5}
        />
      </Link>

      {showTooltip && (
        <Tooltip id="nav-search" placement="top">
          <Typo.Body size="small" className="text-zinc-600 whitespace-nowrap">
            준비중이에요! 조금만 기다려주세요 😊
          </Typo.Body>
        </Tooltip>
      )}
    </nav>
  );
}
