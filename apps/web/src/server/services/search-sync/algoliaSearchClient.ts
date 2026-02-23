import { algoliasearch } from "algoliasearch";

export interface AlgoliaSearchClientLike {
  saveObject<T extends { objectID: string }>(indexName: string, object: T): Promise<void>;
  saveObjects<T extends { objectID: string }>(indexName: string, objects: T[]): Promise<void>;
  deleteObject(indexName: string, objectID: string): Promise<void>;
  deleteObjects(indexName: string, objectIDs: string[]): Promise<void>;
  searchObjects<T>(indexName: string, query: string, hitsPerPage?: number): Promise<T[]>;
}

export class AlgoliaSearchClient implements AlgoliaSearchClientLike {
  private client: ReturnType<typeof algoliasearch> | null;

  constructor(client?: ReturnType<typeof algoliasearch>) {
    this.client = client ?? null;
  }

  async saveObject<T extends { objectID: string }>(indexName: string, object: T): Promise<void> {
    await this.getClient().saveObject({
      indexName,
      body: object,
    });
  }

  async saveObjects<T extends { objectID: string }>(
    indexName: string,
    objects: T[],
  ): Promise<void> {
    if (objects.length === 0) {
      return;
    }

    await this.getClient().saveObjects({
      indexName,
      objects,
    });
  }

  async deleteObject(indexName: string, objectID: string): Promise<void> {
    await this.getClient().deleteObject({
      indexName,
      objectID,
    });
  }

  async deleteObjects(indexName: string, objectIDs: string[]): Promise<void> {
    if (objectIDs.length === 0) {
      return;
    }

    await this.getClient().deleteObjects({
      indexName,
      objectIDs,
    });
  }

  async searchObjects<T>(indexName: string, query: string, hitsPerPage = 20): Promise<T[]> {
    const response = await this.getClient().searchSingleIndex({
      indexName,
      searchParams: {
        query,
        hitsPerPage,
      },
    });

    return (response.hits ?? []) as T[];
  }

  private getClient() {
    if (this.client) {
      return this.client;
    }

    this.client = this.createClient();
    return this.client;
  }

  private createClient() {
    const appId = process.env.ALGOLIA_APP_ID;
    const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;

    if (!appId) {
      throw new Error("ALGOLIA_APP_ID 환경변수가 설정되지 않았습니다.");
    }

    if (!adminApiKey) {
      throw new Error("ALGOLIA_ADMIN_API_KEY 환경변수가 설정되지 않았습니다.");
    }

    return algoliasearch(appId, adminApiKey);
  }
}

export const algoliaSearchClient = new AlgoliaSearchClient();
