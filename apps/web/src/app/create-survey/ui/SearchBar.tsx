import { Input } from '@repo/ui/components';

const SEARCH_BAR_PLACEHOLDER = '질문 제목을 검색해주세요';

export function SearchBar({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}) {
  return (
    <Input
      placeholder={SEARCH_BAR_PLACEHOLDER}
      containerClassName="flex-1"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  );
}
