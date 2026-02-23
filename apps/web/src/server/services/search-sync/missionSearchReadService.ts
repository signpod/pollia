import type { MissionSearchRecord } from "@/server/search";
import { algoliasearch } from "algoliasearch";

export class MissionSearchReadService {
  private client: ReturnType<typeof algoliasearch> | null;

  constructor(private indexName = process.env.ALGOLIA_INDEX_NAME) {
    this.client = null;
  }

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

  private getClient() {
    if (this.client) {
      return this.client;
    }

    this.client = createReadClient();
    return this.client;
  }
}

export const missionSearchReadService = new MissionSearchReadService();

function createReadClient() {
  const appId = process.env.ALGOLIA_APP_ID;
  const writeApiKey = process.env.ALGOLIA_WRITE_API_KEY;

  if (!appId) {
    throw new Error("ALGOLIA_APP_ID 환경변수가 설정되지 않았습니다.");
  }

  if (!writeApiKey) {
    throw new Error("ALGOLIA_WRITE_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  return algoliasearch(appId, writeApiKey);
}
