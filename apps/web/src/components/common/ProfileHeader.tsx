"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import { useSearchMissions } from "@/hooks/search";
import { useCurrentUser } from "@/hooks/user";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import type { MissionSearchRecord } from "@/server/search/missionSearchContract";
import { Typo } from "@repo/ui/components";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRightIcon, SearchIcon, TrendingUpIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useDeferredValue, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ProfileHeaderView } from "./ProfileHeaderView";

const POPULAR_SEARCHES = ["개발자 MBTI 테스트", "나에게 맞는 연애 상대는?", "오늘의 저녁 메뉴?"];

interface ProfileHeaderProps {
  showBack?: boolean;
  fallbackRight?: ReactNode;
}

export function ProfileHeader({ showBack, fallbackRight }: ProfileHeaderProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const profileImageUrl = useProfileImageUrl();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDeferredValue(query);
  const { data, isLoading } = useSearchMissions(debouncedQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = data?.data ?? [];
  const serverError = data?.error;
  const trimmedQuery = debouncedQuery.trim();
  const isDeferred = query.trim() !== trimmedQuery;
  const isPending = isLoading || isDeferred;
  const hasQuery = query.trim().length > 0;

  function close() {
    setIsOpen(false);
    inputRef.current?.blur();
  }

  function handleSelect(mission: MissionSearchRecord) {
    setQuery("");
    close();
    router.push(ROUTES.MISSION(mission.objectID));
  }

  function handleSubmit() {
    const trimmed = query.trim();
    if (!trimmed) return;
    close();
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(trimmed)}`);
  }

  function handlePopularSearch(term: string) {
    setQuery(term);
    close();
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(term)}`);
  }

  const searchInput = (
    <div className="relative">
      <div className="flex h-9 items-center gap-2 rounded-full bg-zinc-100 px-3">
        <SearchIcon className="size-4 shrink-0 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
            if (e.key === "Escape") {
              close();
            }
          }}
          placeholder="검색"
          className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
        />
        {query && (
          <button
            type="button"
            onMouseDown={e => {
              e.preventDefault();
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <XIcon className="size-4 text-zinc-400" />
          </button>
        )}
      </div>
    </div>
  );

  const dimOverlay = createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={close}
        />
      )}
    </AnimatePresence>,
    document.body,
  );

  const searchDropdown = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute top-full left-0 right-0 z-50 overflow-hidden bg-white shadow-lg origin-top"
          initial={{ opacity: 0, scaleY: 0.95, y: -4 }}
          animate={{ opacity: 1, scaleY: 1, y: 0 }}
          exit={{ opacity: 0, scaleY: 0.95, y: -4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {!hasQuery && (
            <div className="px-5 py-4">
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingUpIcon className="size-4 text-violet-500" />
                <Typo.SubTitle size="large">인기 검색어</Typo.SubTitle>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handlePopularSearch(term)}
                    className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 transition-colors hover:bg-zinc-50"
                  >
                    <SearchIcon className="size-3.5 text-zinc-400" />
                    <Typo.Body size="small">{term}</Typo.Body>
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasQuery && (
            <div>
              {isPending && (
                <div className="px-5 py-4 text-center">
                  <Typo.Body size="medium" className="text-zinc-400">
                    검색 중...
                  </Typo.Body>
                </div>
              )}
              {!isPending && serverError && (
                <div className="px-5 py-4 text-center">
                  <Typo.Body size="medium" className="text-red-400">
                    {serverError}
                  </Typo.Body>
                </div>
              )}
              {!isPending && !serverError && trimmedQuery && results.length === 0 && (
                <div className="px-5 py-4 text-center">
                  <Typo.Body size="medium" className="text-zinc-400">
                    검색 결과가 없어요
                  </Typo.Body>
                </div>
              )}
              {!isPending && results.length > 0 && (
                <>
                  <ul>
                    {results.slice(0, 4).map(mission => (
                      <li key={mission.objectID}>
                        <button
                          type="button"
                          className="flex w-full flex-col gap-0.5 px-5 py-2.5 text-left transition-colors hover:bg-zinc-50"
                          onMouseDown={e => {
                            e.preventDefault();
                            handleSelect(mission);
                          }}
                        >
                          <Typo.Body size="small" className="text-sub">
                            {MISSION_CATEGORY_LABELS[mission.category] ?? mission.category}
                          </Typo.Body>
                          <Typo.Body size="medium" className="line-clamp-1">
                            {mission.title}
                          </Typo.Body>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between border-t border-zinc-100 px-5 py-3 transition-colors hover:bg-zinc-50"
                    onMouseDown={e => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                  >
                    <Typo.Body size="medium" className="font-medium text-primary">
                      &ldquo;{trimmedQuery}&rdquo; 전체 검색 결과 보기
                    </Typo.Body>
                    <ChevronRightIcon className="size-4 text-primary" />
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <ProfileHeaderView
        showBack={showBack}
        fallbackRight={fallbackRight}
        searchInput={searchInput}
        searchDropdown={searchDropdown}
        user={currentUser}
        profileImageUrl={profileImageUrl}
        onBack={() => router.back()}
        onProfileClick={() => router.push(ROUTES.ME)}
      />
      {dimOverlay}
    </>
  );
}
