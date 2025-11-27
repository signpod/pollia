import { useAtom } from "jotai";
import { PrimitiveAtom } from "jotai";
import { ChangeEvent, useCallback } from "react";

/**
 * Generic Search Query Hook
 *
 * 디자인 패턴:
 * - Custom Hook Pattern: 재사용 가능한 상태 로직
 * - Dependency Injection: atom을 주입받아 유연하게 사용
 *
 * @param searchQueryAtom - Jotai atom for search query state
 * @returns 검색 쿼리와 핸들러 함수
 *
 * @example
 * ```tsx
 * const { searchQuery, handleChange, setSearchQuery } = useSearchQuery(mySearchAtom);
 *
 * <input value={searchQuery} onChange={handleChange} />
 * ```
 */
export function useSearchQuery(searchQueryAtom: PrimitiveAtom<string>) {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    handleChange,
    clearSearch,
  };
}
