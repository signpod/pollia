"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import { useSearchMissions } from "@/hooks/search";
import { useCurrentUser } from "@/hooks/user";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import type { MissionSearchRecord } from "@/server/search/missionSearchContract";
import { ChevronRightIcon, SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useDeferredValue, useEffect, useRef, useState } from "react";
import { ProfileHeaderView } from "./ProfileHeaderView";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = data?.data ?? [];
  const serverError = data?.error;
  const trimmedQuery = debouncedQuery.trim();
  const isDeferred = query.trim() !== trimmedQuery;
  const isPending = isLoading || isDeferred;
  const showDropdown = isOpen && query.trim().length > 0;

  function handleSelect(mission: MissionSearchRecord) {
    setQuery("");
    setIsOpen(false);
    router.push(ROUTES.MISSION(mission.objectID));
  }

  function handleSubmit() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    inputRef.current?.blur();
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(trimmed)}`);
  }

  const searchInput = (
    <div ref={containerRef} className="relative">
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
          }}
          placeholder="미션 검색"
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

      {showDropdown && (
        <div className="absolute top-full left-0 z-100 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg">
          {isPending && (
            <div className="px-3 py-4 text-center text-sm text-zinc-400">검색 중...</div>
          )}
          {!isPending && serverError && (
            <div className="px-3 py-4 text-center text-sm text-red-400">{serverError}</div>
          )}
          {!isPending && !serverError && trimmedQuery && results.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-zinc-400">검색 결과가 없어요</div>
          )}
          {!isPending && results.length > 0 && (
            <>
              <ul>
                {results.slice(0, 4).map(mission => (
                  <li key={mission.objectID}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-zinc-50"
                      onMouseDown={e => {
                        e.preventDefault();
                        handleSelect(mission);
                      }}
                    >
                      <span className="text-[10px] font-bold text-zinc-500">
                        {MISSION_CATEGORY_LABELS[mission.category] ?? mission.category}
                      </span>
                      <span className="line-clamp-1 text-sm text-zinc-900">{mission.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="flex w-full items-center justify-between border-t border-zinc-100 px-3 py-2.5 text-sm font-medium text-primary hover:bg-zinc-50"
                onMouseDown={e => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <span>&ldquo;{trimmedQuery}&rdquo; 전체 검색 결과 보기</span>
                <ChevronRightIcon className="size-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <ProfileHeaderView
      showBack={showBack}
      fallbackRight={fallbackRight}
      searchInput={searchInput}
      user={currentUser}
      profileImageUrl={profileImageUrl}
      onBack={() => router.back()}
      onProfileClick={() => router.push(ROUTES.ME)}
    />
  );
}
