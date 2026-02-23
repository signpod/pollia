"use client";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/user";
import HomeIconFilled from "@public/svgs/home-icon-filled.svg";
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

  const isHome = pathname === ROUTES.HOME;
  const isLikes = pathname === ROUTES.LIKES;

  return (
    <nav className="flex w-full items-center border-t border-zinc-100 bg-white shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]">
      <Link
        href={ROUTES.HOME}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        aria-label="홈"
      >
        {isHome ? (
          <HomeIconFilled className="size-6 text-black" />
        ) : (
          <HomeIcon className="size-6 text-zinc-400" strokeWidth={1.5} />
        )}
        <Typo.Body
          size="small"
          className={`text-[11px] font-bold leading-normal ${isHome ? "text-black" : "text-zinc-400"}`}
        >
          홈
        </Typo.Body>
      </Link>

      <span
        data-tooltip-id="nav-search"
        className="flex flex-1 cursor-not-allowed flex-col items-center justify-center gap-0.5 py-2 opacity-30"
        aria-label="검색"
        aria-disabled="true"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(prev => !prev)}
      >
        <Search className="size-6 text-zinc-400" strokeWidth={1.5} />
        <Typo.Body size="small" className="text-[11px] font-bold leading-normal text-zinc-400">
          검색
        </Typo.Body>
      </span>

      <Link
        href={ROUTES.LIKES}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        aria-label="찜"
        onClick={handleLikesClick}
      >
        <Heart
          className={`size-6 ${isLikes ? "text-black" : "text-zinc-400"}`}
          fill={isLikes ? "currentColor" : "none"}
          strokeWidth={isLikes ? 2 : 1.5}
        />
        <Typo.Body
          size="small"
          className={`text-[11px] font-bold leading-normal ${isLikes ? "text-black" : "text-zinc-400"}`}
        >
          찜
        </Typo.Body>
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
