import { toMissionSearchRecord } from "@/server/search";
import { type AlgoliaSearchClientLike, algoliaSearchClient } from "./algoliaSearchClient";

type MissionForSearchSync = Parameters<typeof toMissionSearchRecord>[0];

export class MissionSearchSyncService {
  constructor(
    private client: AlgoliaSearchClientLike = algoliaSearchClient,
    private indexName = process.env.ALGOLIA_INDEX_NAME,
  ) {}

  async indexMission(mission: MissionForSearchSync): Promise<void> {
    const record = toMissionSearchRecord(mission);
    await this.client.saveObject(this.getIndexName(), record);
  }

  async deleteMission(objectID: string): Promise<void> {
    await this.client.deleteObject(this.getIndexName(), objectID);
  }

  private getIndexName(): string {
    if (!this.indexName) {
      throw new Error("ALGOLIA_INDEX_NAME 환경변수가 설정되지 않았습니다.");
    }

    return this.indexName;
  }
}

export const missionSearchSyncService = new MissionSearchSyncService();
