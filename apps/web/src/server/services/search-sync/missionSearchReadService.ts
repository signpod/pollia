import { MISSION_SEARCH_INDEX_NAME, type MissionSearchRecord } from "@/server/search";
import { type AlgoliaSearchClientLike, algoliaSearchClient } from "./algoliaSearchClient";

export class MissionSearchReadService {
  constructor(
    private client: AlgoliaSearchClientLike = algoliaSearchClient,
    private indexName = process.env.ALGOLIA_INDEX_NAME,
  ) {}

  async searchMissions(query: string, hitsPerPage = 20): Promise<MissionSearchRecord[]> {
    const keyword = query.trim();
    if (!keyword) {
      return [];
    }

    return this.client.searchObjects<MissionSearchRecord>(
      this.getIndexName(),
      keyword,
      hitsPerPage,
    );
  }

  private getIndexName(): string {
    return this.indexName || MISSION_SEARCH_INDEX_NAME;
  }
}

export const missionSearchReadService = new MissionSearchReadService();
