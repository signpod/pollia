"use client";
"use client";

import { BaseSearchBar } from "@/components/common/BaseSearchBar";
import { useSearchQuery } from "@/hooks/common/useSearchQuery";
import { searchQueryAtom } from "@/atoms/create";

const SEARCH_BAR_PLACEHOLDER = "질문 제목을 검색해주세요";
const SEARCH_BAR_PLACEHOLDER = "질문 제목을 검색해주세요";

export function SearchBar() {
  const { searchQuery, handleChange } = useSearchQuery(searchQueryAtom);

  return (
    <BaseSearchBar
      placeholder={SEARCH_BAR_PLACEHOLDER}
      containerClassName="flex-1"
      value={searchQuery}
      onChange={handleChange}
    />
  );
}
