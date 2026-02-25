"use client";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/user";
import HomeIconFilled from "@public/svgs/home-icon-filled.svg";
import HomeIcon from "@public/svgs/home-icon.svg";
import { Typo, useDrawer } from "@repo/ui/components";
import { Heart, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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

  useEffect(() => {
    router.prefetch(ROUTES.LIKES);
    router.prefetch(ROUTES.CREATE);
  }, [router]);

  const handleLikesClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      openLoginDrawer();
    }
  };

  const handleCreateClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      openLoginDrawer();
    }
  };

  const isHome = pathname === ROUTES.HOME;
  const isLikes = pathname === ROUTES.LIKES;
  const isCreate = pathname === ROUTES.CREATE;

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

      <Link
        href={ROUTES.CREATE}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        aria-label="만들기"
        onClick={handleCreateClick}
      >
        <Plus
          className={`size-6 ${isCreate ? "text-black" : "text-zinc-400"}`}
          strokeWidth={isCreate ? 2 : 1.5}
        />
        <Typo.Body
          size="small"
          className={`text-[11px] font-bold leading-normal ${isCreate ? "text-black" : "text-zinc-400"}`}
        >
          만들기
        </Typo.Body>
      </Link>

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
    </nav>
  );
}
