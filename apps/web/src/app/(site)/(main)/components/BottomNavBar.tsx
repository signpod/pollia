"use client";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/user";
import CommunityIcon from "@public/svgs/community-icon.svg";
import EditorIconFill from "@public/svgs/editor-icon-fill.svg";
import EditorIcon from "@public/svgs/editor-icon.svg";
import HomeIconFilled from "@public/svgs/home-icon-filled.svg";
import HomeIcon from "@public/svgs/home-icon.svg";
import LikeIconFill from "@public/svgs/like-icon-fill.svg";
import LikeIcon from "@public/svgs/like-icon.svg";
import PickIcon from "@public/svgs/pick-icon.svg";
import { Tooltip, Typo, useDrawer } from "@repo/ui/components";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [isEditorPopupOpen, setIsEditorPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    router.prefetch(ROUTES.LIKES);
  }, [router]);

  useEffect(() => {
    if (!isEditorPopupOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsEditorPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isEditorPopupOpen]);

  const handleEditorClick = useCallback(() => {
    if (!isLoggedIn) {
      openLoginDrawer();
      return;
    }
    setIsEditorPopupOpen(prev => !prev);
  }, [isLoggedIn, openLoginDrawer]);

  const handleCategorySelect = useCallback(
    (category: "RESEARCH" | "TEST") => {
      setIsEditorPopupOpen(false);
      router.push(`${ROUTES.CREATE_MISSION}?category=${category}`);
    },
    [router],
  );

  const handleLikesClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      openLoginDrawer();
    }
  };

  const isHome = pathname === ROUTES.HOME;
  const isEditor = pathname === "/editor" || pathname.startsWith("/editor/");
  const isLikes = pathname === ROUTES.LIKES;

  const comingSoonProps = (id: string) =>
    ({
      "data-tooltip-id": id,
      onMouseEnter: () => setActiveTooltip(id),
      onMouseLeave: () => setActiveTooltip(null),
      onClick: () => setActiveTooltip(prev => (prev === id ? null : id)),
    }) as const;

  return (
    <nav className="relative z-50 flex w-full items-center border-t border-zinc-100 bg-white px-1 shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]">
      <Link
        href={ROUTES.HOME}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        aria-label="홈"
      >
        {isHome ? (
          <HomeIconFilled className="size-6 text-black" />
        ) : (
          <HomeIcon className="size-6 text-zinc-400" />
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
        aria-label="PICK"
        aria-disabled="true"
      >
        <PickIcon className="size-6" />
        <Typo.Body size="small" className="text-[11px] font-bold leading-normal text-zinc-400">
          PICK
        </Typo.Body>
      </span>

      <Link
        href={ROUTES.CREATE_MISSION}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        aria-label="에디터"
      >
        {isEditor ? <EditorIconFill className="size-6" /> : <EditorIcon className="size-6" />}
        <Typo.Body
          size="small"
          className={`text-[11px] font-bold leading-normal ${isEditor ? "text-black" : "text-zinc-400"}`}
        >
          에디터
        </Typo.Body>
      </Link>

      <Link
        href={ROUTES.LIKES}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        aria-label="찜"
        onClick={handleLikesClick}
      >
        {isLikes ? <LikeIconFill className="size-6" /> : <LikeIcon className="size-6" />}
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
        <CommunityIcon className="size-6" />
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
