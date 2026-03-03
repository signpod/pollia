"use client";

import { useSearchMissions } from "@/hooks/search";
import type { MissionSearchRecord } from "@/server/search/missionSearchContract";
import { Typo } from "@repo/ui/components";
import { ChevronLeftIcon, SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react";
import type { SearchResultItemData } from "./SearchResultItem";
import { SearchResultItem } from "./SearchResultItem";

const RECENT_SEARCHES_KEY = "pollia-recent-searches";
const MAX_RECENT_SEARCHES = 10;

const RECOMMENDED_SEARCHES = [
  "개발자 MBTI 테스트",
  "나에게 맞는 연애 상대는?",
  "오늘의 저녁 메뉴?",
];

const POPULAR_PROJECTS = ["개발자 mbti 테스트", "나에게 맞는 연애 상대는?", "오늘의 저녁 메뉴?"];

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const searches = getRecentSearches().filter(s => s !== term);
  searches.unshift(term);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES)));
}

function removeRecentSearch(term: string) {
  const searches = getRecentSearches().filter(s => s !== term);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

function clearAllRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

export function SearchClient() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const deferredQuery = useDeferredValue(submittedQuery);
  const { data, isLoading } = useSearchMissions(deferredQuery);

  const results: SearchResultItemData[] = (data?.data ?? []).map((record: MissionSearchRecord) => ({
    id: record.objectID,
    title: record.title,
    imageUrl: "",
    category: record.category,
  }));

  const isPending = isLoading || submittedQuery !== deferredQuery;
  const hasSubmitted = submittedQuery.length > 0;

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    setRecentSearches(getRecentSearches());
    setSubmittedQuery(trimmed);
  }, [query]);

  function handleChipSearch(term: string) {
    setQuery(term);
    saveRecentSearch(term);
    setRecentSearches(getRecentSearches());
    setSubmittedQuery(term);
  }

  function handleRemoveRecent(term: string) {
    removeRecentSearch(term);
    setRecentSearches(getRecentSearches());
  }

  function handleClearAll() {
    clearAllRecentSearches();
    setRecentSearches([]);
  }

  return (
    <div className="relative z-50 -mt-15 min-h-screen bg-white">
      {/* Self Header */}
      <header className="sticky top-0 z-50 flex h-15 items-center gap-2 bg-white px-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-12 items-center justify-center"
        >
          <ChevronLeftIcon className="size-6" />
        </button>
        <Typo.SubTitle size="large">검색</Typo.SubTitle>
      </header>

      {/* Search Input */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between rounded-full bg-[#fafafa] px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              if (e.target.value.trim() === "") {
                setSubmittedQuery("");
              }
            }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="검색어를 입력해 주세요"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSubmittedQuery("");
                inputRef.current?.focus();
              }}
              className="shrink-0"
            >
              <XIcon className="size-[18px] text-zinc-400" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} className="shrink-0">
              <SearchIcon className="size-[18px] text-zinc-400" />
            </button>
          )}
        </div>
      </div>
      <div className="h-px bg-zinc-100" />

      {/* Search Results */}
      {hasSubmitted ? (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2 px-5 pb-4">
            <Typo.SubTitle size="large" className="text-default">
              &ldquo;{submittedQuery}&rdquo; 검색 결과
            </Typo.SubTitle>
            {!isPending && (
              <Typo.Body size="small" className="font-bold text-primary">
                {results.length}개
              </Typo.Body>
            )}
          </div>

          {isPending && (
            <div className="flex flex-col items-center py-16">
              <Typo.Body size="medium" className="text-sub">
                검색 중...
              </Typo.Body>
            </div>
          )}

          {!isPending && results.length > 0 && (
            <div className="divide-y divide-zinc-100">
              {results.map(item => (
                <SearchResultItem key={item.id} item={item} />
              ))}
            </div>
          )}

          {!isPending && results.length === 0 && (
            <div className="flex flex-col items-center py-16">
              <Typo.Body size="medium" className="text-sub">
                검색 결과가 없어요
              </Typo.Body>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-10 p-5">
          {/* Recent Searches */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Typo.SubTitle size="large">최근 검색어</Typo.SubTitle>
              {recentSearches.length > 0 && (
                <button type="button" onClick={handleClearAll}>
                  <Typo.Body size="small" className="font-bold text-zinc-500">
                    전체삭제
                  </Typo.Body>
                </button>
              )}
            </div>
            {recentSearches.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleChipSearch(term)}
                    className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-2 transition-colors hover:bg-zinc-50"
                  >
                    <Typo.Body size="small" className="font-bold">
                      {term}
                    </Typo.Body>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveRecent(term);
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          handleRemoveRecent(term);
                        }
                      }}
                    >
                      <XIcon className="size-5 text-zinc-400" />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <Typo.Body size="small" className="text-sub">
                최근 본 프로젝트가 없어요
              </Typo.Body>
            )}
          </section>

          {/* Recommended Searches */}
          <section className="flex flex-col gap-4">
            <Typo.SubTitle size="large">추천 검색어</Typo.SubTitle>
            <div className="flex flex-wrap gap-2">
              {RECOMMENDED_SEARCHES.map(term => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleChipSearch(term)}
                  className="rounded-full border border-zinc-200 px-3 py-2 transition-colors hover:bg-zinc-50"
                >
                  <Typo.Body size="small" className="font-bold">
                    {term}
                  </Typo.Body>
                </button>
              ))}
            </div>
          </section>

          {/* Popular Projects */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Typo.SubTitle size="large">인기 프로젝트</Typo.SubTitle>
              <Typo.Body size="small" className="font-bold text-zinc-400">
                {new Date().toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })} 기준
              </Typo.Body>
            </div>
            <ol className="flex flex-col gap-4">
              {POPULAR_PROJECTS.map((title, index) => (
                <li key={title}>
                  <button
                    type="button"
                    onClick={() => handleChipSearch(title)}
                    className="flex w-full items-center text-left transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex size-5 shrink-0 items-center justify-center">
                      <Typo.Body size="small" className="font-bold text-primary">
                        {index + 1}
                      </Typo.Body>
                    </div>
                    <Typo.Body size="medium" className="line-clamp-1">
                      {title}
                    </Typo.Body>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </div>
  );
}
