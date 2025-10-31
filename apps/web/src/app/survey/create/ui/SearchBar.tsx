"use client";

import { useAtom } from "jotai";
import { Input } from "@repo/ui/components";
import { searchQueryAtom } from "@/atoms/create";

const SEARCH_BAR_PLACEHOLDER = "질문 제목을 검색해주세요";

export function SearchBar() {
  const { searchQuery, handleChange } = useSearchBar();

  return (
    <Input
      placeholder={SEARCH_BAR_PLACEHOLDER}
      containerClassName="flex-1"
      value={searchQuery}
      onChange={handleChange}
    />
  );
}

function useSearchBar() {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return { searchQuery, handleChange };
}
