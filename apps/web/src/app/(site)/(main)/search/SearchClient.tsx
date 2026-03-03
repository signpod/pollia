"use client";

import { useSearchMissions } from "@/hooks/search";
import type { MissionSearchRecord } from "@/server/search/missionSearchContract";
import { Typo } from "@repo/ui/components";
import { ChevronLeftIcon, Loader2, SearchIcon, XIcon } from "lucide-react";
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
    likesCount: record.likesCount,
    // TODO: 백엔드에 조회수(viewCount) 필드 구현 시 실제 데이터로 교체
    viewCount:
      200 +
      (Math.abs(record.objectID.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)) %
        4800),
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
    <div className="relative z-50 -mt-14 min-h-screen bg-white">
      <header className="sticky top-0 z-50 flex h-14 items-center gap-2 bg-white px-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-12 items-center justify-center"
        >
          <ChevronLeftIcon className="size-6" />
        </button>
        <Typo.SubTitle size="large">검색</Typo.SubTitle>
      </header>

      <div className="px-5 py-3">
        <div className="flex h-[45px] items-center gap-3 rounded-full bg-zinc-50 px-4">
          <SearchIcon className="size-[18px] shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
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
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSubmittedQuery("");
                inputRef.current?.focus();
              }}
              className="shrink-0"
            >
              <XIcon className="size-5 text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {hasSubmitted ? (
        <div className="flex flex-col gap-4 p-5">
          {isPending && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-zinc-400" />
            </div>
          )}

          {!isPending && results.length > 0 && (
            <>
              <div className="flex items-center gap-1">
                <Typo.ButtonText size="large" className="text-primary">
                  {submittedQuery}
                </Typo.ButtonText>
                <Typo.Body size="medium">검색 결과 {results.length}개</Typo.Body>
              </div>
              <div className="flex flex-col gap-4">
                {results.map((item, index) => (
                  <div key={item.id}>
                    <SearchResultItem item={item} query={submittedQuery} />
                    {index < results.length - 1 && <div className="mt-4 h-px bg-zinc-100" />}
                  </div>
                ))}
              </div>
            </>
          )}

          {!isPending && results.length === 0 && (
            <Typo.Body size="medium" className="text-disabled">
              해당하는 프로젝트가 없어요
            </Typo.Body>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-10 p-5">
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
                      <XIcon className="size-4 text-zinc-400" />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <Typo.Body size="small" className="text-sub">
                최근 검색어가 없어요
              </Typo.Body>
            )}
          </section>

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
                    className="flex w-full items-center gap-0.5 text-left transition-colors hover:bg-zinc-50"
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
