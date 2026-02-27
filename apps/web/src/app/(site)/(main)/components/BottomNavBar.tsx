"use client";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/user";
import HomeIconFilled from "@public/svgs/home-icon-filled.svg";
import HomeIcon from "@public/svgs/home-icon.svg";
import { Tooltip, Typo, useDrawer } from "@repo/ui/components";
import { BadgePlus, Heart, MessageCircle, Store } from "lucide-react";
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
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

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
  const isCreate = pathname === ROUTES.CREATE_MISSION;
  const isLikes = pathname === ROUTES.LIKES;

  const comingSoonProps = (id: string) =>
    ({
      "data-tooltip-id": id,
      onMouseEnter: () => setActiveTooltip(id),
      onMouseLeave: () => setActiveTooltip(null),
      onClick: () => setActiveTooltip(prev => (prev === id ? null : id)),
    }) as const;

  return (
    <nav className="flex w-full items-center border-t border-zinc-100 bg-white shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]">
      <Link
        href={ROUTES.HOME}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        aria-label="홈"
      >
        {isHome ? (
          <HomeIconFilled className="size-7 text-black" />
        ) : (
          <HomeIcon className="size-7 text-zinc-400" strokeWidth={1.5} />
        )}
        <Typo.Body
          size="small"
          className={`text-[11px] font-bold leading-normal ${isHome ? "text-black" : "text-zinc-400"}`}
        >
          홈
        </Typo.Body>
      </Link>

      <span
        {...comingSoonProps("nav-store")}
        className="flex flex-1 cursor-not-allowed flex-col items-center justify-center gap-0.5 py-2 opacity-30"
        aria-label="스토어"
        aria-disabled="true"
      >
        <Store className="size-7 text-zinc-400" strokeWidth={1.5} />
        <Typo.Body size="small" className="text-[11px] font-bold leading-normal text-zinc-400">
          스토어
        </Typo.Body>
      </span>

      <Link
        href={ROUTES.CREATE_MISSION}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        aria-label="에디트"
      >
        <BadgePlus
          className={`size-7 ${isCreate ? "fill-black text-black [&>line]:stroke-white" : "text-zinc-400"}`}
          strokeWidth={isCreate ? 2 : 1.5}
        />
        <Typo.Body
          size="small"
          className={`text-[11px] font-bold leading-normal ${isCreate ? "text-black" : "text-zinc-400"}`}
        >
          에디트
        </Typo.Body>
      </Link>

      <Link
        href={ROUTES.LIKES}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        aria-label="찜"
        onClick={handleLikesClick}
      >
        <Heart
          className={`size-7 ${isLikes ? "text-black" : "text-zinc-400"}`}
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

      <span
        {...comingSoonProps("nav-community")}
        className="flex flex-1 cursor-not-allowed flex-col items-center justify-center gap-0.5 py-2 opacity-30"
        aria-label="커뮤니티"
        aria-disabled="true"
      >
        <MessageCircle className="size-7 text-zinc-400" strokeWidth={1.5} />
        <Typo.Body size="small" className="text-[11px] font-bold leading-normal text-zinc-400">
          커뮤니티
        </Typo.Body>
      </span>

      {activeTooltip && (
        <Tooltip id={activeTooltip} placement="top">
          <Typo.Body size="small" className="text-zinc-600 whitespace-nowrap">
            준비중이에요! 조금만 기다려주세요 😊
          </Typo.Body>
        </Tooltip>
      )}
    </nav>
  );
}
