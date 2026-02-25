"use client";

import { searchMissionsPublic } from "@/actions/search";
import type { MissionSearchRecord } from "@/server/search";
import { Typo } from "@repo/ui/components";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SurveyCardData } from "../../components/SurveyCard";
import { SurveyCard } from "../../components/SurveyCard";
import {
  POPULAR_SEARCH_KEYWORDS,
  RECENT_SEARCH_STORAGE_KEY,
  SEARCH_RESULTS_PAGE_SIZE,
} from "../constants";
import { SearchResultCard } from "./SearchResultCard";

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(list: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function addRecentSearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return getRecentSearches();
  const current = getRecentSearches();
  const filtered = current.filter(k => k !== trimmed);
  const next = [trimmed, ...filtered].slice(0, 10);
  saveRecentSearches(next);
  return next;
}

function removeRecentSearch(query: string): string[] {
  const current = getRecentSearches();
  const next = current.filter(k => k !== query);
  saveRecentSearches(next);
  return next;
}

interface SearchContentProps {
  initialQuery: string | null;
  recommendedMissions: SurveyCardData[];
}

export function SearchContent({ initialQuery, recommendedMissions }: SearchContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? initialQuery ?? "";

  const [inputValue, setInputValue] = useState(q);
  const [recentList, setRecentList] = useState<string[]>([]);
  const [results, setResults] = useState<MissionSearchRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [_hasSearched, setHasSearched] = useState(!!q);

  useEffect(() => {
    setRecentList(getRecentSearches());
  }, []);

  useEffect(() => {
    setInputValue(q);
    if (!q) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    let cancelled = false;
    setIsSearching(true);
    searchMissionsPublic({ query: q, hitsPerPage: SEARCH_RESULTS_PAGE_SIZE })
      .then(res => {
        if (!cancelled) setResults(res.data);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (!trimmed) return;
      setRecentList(_prev => addRecentSearch(trimmed));
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [inputValue, router],
  );

  const showInitial = !q;
  const popularList = useMemo(() => POPULAR_SEARCH_KEYWORDS, []);

  return (
    <main className="min-h-screen bg-white pb-20">
      <form
        onSubmit={handleSubmit}
        className="sticky top-12 z-40 border-b border-default bg-white px-5 py-3"
      >
        <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2">
          <svg
            className="size-4 shrink-0 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>검색</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="min-w-0 flex-1 bg-transparent text-sm text-default placeholder:text-zinc-500 focus:outline-none"
            aria-label="검색어"
          />
          {inputValue.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                router.push("/search");
              }}
              className="shrink-0 text-zinc-400 hover:text-zinc-600"
              aria-label="지우기"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <title>지우기</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </form>

      <div className="px-5 pt-6">
        {showInitial ? (
          <div className="flex flex-col gap-8">
            {recentList.length > 0 && (
              <section>
                <Typo.Body size="small" className="mb-3 font-bold text-default">
                  최근 검색어
                </Typo.Body>
                <div className="flex flex-wrap gap-2">
                  {recentList.map(keyword => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-default"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setInputValue(keyword);
                          router.push(`/search?q=${encodeURIComponent(keyword)}`);
                        }}
                        className="text-left"
                      >
                        {keyword}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecentList(removeRecentSearch(keyword))}
                        className="shrink-0 text-zinc-400 hover:text-zinc-600"
                        aria-label={`${keyword} 삭제`}
                      >
                        <span className="text-sm">×</span>
                      </button>
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section>
              <Typo.Body size="small" className="mb-3 font-bold text-default">
                인기 검색어
              </Typo.Body>
              <ol className="flex flex-col gap-2">
                {popularList.map((keyword, i) => (
                  <li key={keyword}>
                    <button
                      type="button"
                      onClick={() => {
                        setInputValue(keyword);
                        router.push(`/search?q=${encodeURIComponent(keyword)}`);
                      }}
                      className="flex w-full items-center gap-2 text-left text-sm text-default"
                    >
                      <span className="w-5 shrink-0 text-info">{i + 1}.</span>
                      <span>{keyword}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>

            {recommendedMissions.length > 0 && (
              <section>
                <Typo.Body size="small" className="mb-3 font-bold text-default">
                  고단님의 추천 프로젝트
                </Typo.Body>
                <div className="-mx-5 overflow-x-auto px-5">
                  <div className="flex gap-4 pb-2">
                    {recommendedMissions.map(survey => (
                      <div key={survey.id} className="w-[170px] shrink-0">
                        <SurveyCard survey={survey} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold text-default">검색 결과</h1>
              <Typo.Body size="medium" className="text-info">
                &apos;{q}&apos; 검색 결과
              </Typo.Body>
            </div>

            {isSearching ? (
              <div className="flex justify-center py-12">
                <Typo.Body size="medium" className="text-info">
                  검색 중...
                </Typo.Body>
              </div>
            ) : (
              <>
                <Typo.Body size="medium" className="text-info">
                  {results.length}개의 프로젝트
                </Typo.Body>
                {results.length === 0 ? (
                  <div className="py-12 text-center">
                    <Typo.Body size="medium" className="text-info">
                      검색 결과가 없어요.
                    </Typo.Body>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-10">
                    {results.map(record => (
                      <SearchResultCard key={record.objectID} record={record} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
