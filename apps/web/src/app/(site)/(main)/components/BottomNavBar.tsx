"use client";

import { CreateMissionBottomSheet } from "@/components/common/CreateMissionBottomSheet";
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
import { useCallback, useEffect, useState } from "react";
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

  useEffect(() => {
    router.prefetch(ROUTES.LIKES);
    router.prefetch(ROUTES.ME);
  }, [router]);

  const handleEditorClick = useCallback(() => {
    if (!isLoggedIn) {
      openLoginDrawer();
      return;
    }
    setIsEditorPopupOpen(prev => !prev);
  }, [isLoggedIn, openLoginDrawer]);

  useEffect(() => {
    setIsEditorPopupOpen(false);
  }, [pathname]);

  const handleLikesClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      openLoginDrawer();
    }
  };

  const isHome = !isEditorPopupOpen && pathname === ROUTES.HOME;
  const isEditor =
    !isEditorPopupOpen && (pathname === "/editor" || pathname.startsWith("/editor/"));
  const isLikes = !isEditorPopupOpen && pathname === ROUTES.LIKES;
  const isEditorActive = isEditor || isEditorPopupOpen;

  const comingSoonProps = (id: string) =>
    ({
      "data-tooltip-id": id,
      onMouseEnter: () => setActiveTooltip(id),
      onMouseLeave: () => setActiveTooltip(null),
      onClick: () => setActiveTooltip(prev => (prev === id ? null : id)),
    }) as const;

  return (
    <div className="relative">
      <CreateMissionBottomSheet
        isOpen={isEditorPopupOpen}
        onClose={() => setIsEditorPopupOpen(false)}
        className="pb-20"
      />

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

        <button
          type="button"
          onClick={handleEditorClick}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
          aria-label="에디터"
        >
          {isEditorActive ? (
            <EditorIconFill className="size-6" />
          ) : (
            <EditorIcon className="size-6" />
          )}
          <Typo.Body
            size="small"
            className={`text-[11px] font-bold leading-normal ${isEditorActive ? "text-black" : "text-zinc-400"}`}
          >
            에디터
          </Typo.Body>
        </button>

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

        {activeTooltip === "nav-store" && (
          <Tooltip id="nav-store" placement="top">
            <Typo.Body size="small" className="text-zinc-600 whitespace-nowrap">
              준비중이에요! 조금만 기다려주세요 😊
            </Typo.Body>
          </Tooltip>
        )}
        {activeTooltip === "nav-community" && (
          <div className="absolute bottom-full right-0 mb-3 flex flex-col items-end pr-[calc(10%-7.5px)]">
            <div
              className="relative right-[-16px] rounded-full bg-white px-4 py-2"
              style={{ filter: "drop-shadow(0 4px 20px rgba(0, 0, 0, 0.15))" }}
            >
              <Typo.Body size="small" className="text-zinc-600 whitespace-nowrap">
                준비중이에요! 조금만 기다려주세요 😊
              </Typo.Body>
            </div>
            <svg
              width="15"
              height="13"
              viewBox="0 0 15 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(0 4px 20px rgba(0, 0, 0, 0.15))" }}
            >
              <path
                d="M9.23205 12C8.46225 13.3333 6.53775 13.3333 5.76795 12L0.5718 3C-0.198 1.66666 0.76425 -4.38926e-06 2.30385 -3.98547e-06L12.6962 -1.2599e-06C14.2358 -8.56109e-07 15.198 1.66667 14.4282 3L9.23205 12Z"
                fill="white"
              />
            </svg>
          </div>
        )}
      </nav>
    </div>
  );
}
