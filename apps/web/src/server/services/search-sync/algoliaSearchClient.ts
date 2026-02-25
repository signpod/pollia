import { algoliasearch } from "algoliasearch";

export type AlgoliaClient = ReturnType<typeof algoliasearch>;

let sharedClient: AlgoliaClient | null = null;

export function getAlgoliaClient(): AlgoliaClient {
  if (sharedClient) {
    return sharedClient;
  }

  const appId = process.env.ALGOLIA_APP_ID;
  const writeApiKey = process.env.ALGOLIA_WRITE_API_KEY;

  if (!appId) {
    throw new Error("ALGOLIA_APP_ID 환경변수가 설정되지 않았습니다.");
  }

  if (!writeApiKey) {
    throw new Error("ALGOLIA_WRITE_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  sharedClient = algoliasearch(appId, writeApiKey);
  return sharedClient;
}

export interface AlgoliaSearchClientLike {
  saveObject<T extends { objectID: string }>(indexName: string, object: T): Promise<void>;
  saveObjects<T extends { objectID: string }>(indexName: string, objects: T[]): Promise<void>;
  deleteObject(indexName: string, objectID: string): Promise<void>;
  deleteObjects(indexName: string, objectIDs: string[]): Promise<void>;
}

export class AlgoliaSearchClient implements AlgoliaSearchClientLike {
  constructor(private client?: AlgoliaClient) {}

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

  private getClient(): AlgoliaClient {
    return this.client ?? getAlgoliaClient();
  }
}

export const algoliaSearchClient = new AlgoliaSearchClient();
