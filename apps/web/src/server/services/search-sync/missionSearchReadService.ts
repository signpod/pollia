import type { MissionSearchRecord } from "@/server/search";
import { type AlgoliaClient, getAlgoliaClient } from "./algoliaSearchClient";

export class MissionSearchReadService {
  constructor(
    private client?: AlgoliaClient,
    private indexName = process.env.ALGOLIA_INDEX_NAME,
  ) {}

  async searchMissions(query: string, hitsPerPage = 20): Promise<MissionSearchRecord[]> {
    const keyword = query.trim();
    if (!keyword) {
      return [];
    }

    const response = await this.getClient().searchSingleIndex({
      indexName: this.getIndexName(),
      searchParams: {
        query: keyword,
        hitsPerPage,
      },
    });

    return (response.hits ?? []) as MissionSearchRecord[];
  }

  private getIndexName(): string {
    if (!this.indexName) {
      throw new Error("ALGOLIA_INDEX_NAME 환경변수가 설정되지 않았습니다.");
    }

    return this.indexName;
  }

  private getClient(): AlgoliaClient {
    return this.client ?? getAlgoliaClient();
  }
}

export const missionSearchReadService = new MissionSearchReadService();
