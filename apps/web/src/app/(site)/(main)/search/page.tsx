import { missionSearchReadService } from "@/server/services/search-sync";
import { Typo } from "@repo/ui/components";
import type { SearchResultItemData } from "./SearchResultItem";
import { SearchResultItem } from "./SearchResultItem";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  let results: SearchResultItemData[] = [];

  if (query) {
    const searchResults = await missionSearchReadService.searchMissions(query, 20);

    results = searchResults.map(record => ({
      id: record.objectID,
      title: record.title,
      imageUrl: "",
      category: record.category,
    }));
  }

  return (
    <main className="min-h-screen bg-white pb-10">
      {query && (
        <div className="flex flex-col pt-4">
          <div className="flex items-baseline gap-2 px-5 pb-4">
            <Typo.SubTitle size="large" className="text-default">
              &ldquo;{query}&rdquo; 검색 결과
            </Typo.SubTitle>
            <Typo.Body size="small" className="font-bold text-primary">
              {results.length}개
            </Typo.Body>
          </div>

          {results.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {results.map(item => (
                <SearchResultItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16">
              <Typo.Body size="medium" className="text-sub">
                검색 결과가 없어요
              </Typo.Body>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
