import { Client } from "@notionhq/client";
import type { Mission } from "@prisma/client";
import { buildAnalysisDatabases, buildResponseDatabase } from "./database-builder";
import { type MissionMetadata, buildMissionMetadata } from "./properties";
import {
  type BlockObjectRequest,
  type CreateMissionReportInput,
  type CreateMissionReportResult,
  type DatabasePropertyConfigMap,
  MISSION_DATABASE_PROPERTY_NAMES,
  type PagePropertyValueMap,
} from "./types";
import { stripHtmlTags, truncateText } from "./utils";

export class NotionService {
  private client: Client;

  constructor(private notionClient?: Client) {
    this.client =
      notionClient ||
      new Client({
        auth: process.env.MISSION_REPORT_NOTION_API_KEY,
      });
  }

  async createOrUpdateMissionReport(
    input: CreateMissionReportInput,
  ): Promise<CreateMissionReportResult> {
    const { mission, responses, actions } = input;

    const databaseId = process.env.MISSION_REPORT_NOTION_DATABASE_ID;
    if (!databaseId) {
      const error = new Error("MISSION_REPORT_NOTION_DATABASE_ID 환경변수가 설정되지 않았습니다.");
      error.cause = 500;
      throw error;
    }

    try {
      console.log("[NotionService] 리포트 생성/업데이트 시작:", {
        missionId: mission.id,
        missionTitle: mission.title,
        actionsCount: actions.length,
        responsesCount: responses.length,
      });

      const metadata = buildMissionMetadata(mission, responses);
      console.log("[NotionService] 메타데이터 생성 완료");

      const existingPageId = await this.findMissionPageInDatabase(databaseId, mission.id);

      let notionPageId: string;

      if (existingPageId) {
        console.log("[NotionService] 기존 페이지 발견, Property 업데이트:", existingPageId);
        await this.updateMissionPageProperties(existingPageId, mission, metadata);
        notionPageId = existingPageId;
        console.log("[NotionService] Property 업데이트 완료");
      } else {
        console.log("[NotionService] 기존 페이지 없음, 새 페이지 생성");
        const page = await this.createMissionPageInDatabase(mission, databaseId, metadata);
        notionPageId = page.id;
        console.log("[NotionService] 페이지 생성 완료:", notionPageId);

        const responseDb = buildResponseDatabase(actions, responses);
        await this.createDatabase(notionPageId, responseDb);
        console.log("[NotionService] 응답 데이터베이스 생성 완료");

        const analysisDb = buildAnalysisDatabases(actions, responses);
        let dbIndex = 0;
        for (const db of analysisDb) {
          dbIndex++;
          await this.createDatabase(notionPageId, db);
          console.log(
            `[NotionService] 분석 데이터베이스 ${dbIndex}/${analysisDb.length} 생성 완료`,
          );
        }
      }

      const publicUrl = await this.makePublicUrl(notionPageId);
      console.log("[NotionService] 리포트 생성/업데이트 완료:", publicUrl);

      return {
        notionPageId,
        notionPageUrl: publicUrl,
      };
    } catch (err) {
      console.error("[NotionService] 리포트 생성 실패:", {
        missionId: mission.id,
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
      });

      if (err instanceof Error && err.cause) {
        throw err;
      }

      const error = new Error(
        `노션 리포트 생성 실패: ${err instanceof Error ? err.message : String(err)}`,
      );
      error.cause = 500;
      throw error;
    }
  }

  private async createMissionPageInDatabase(
    mission: Mission,
    databaseId: string,
    metadata: MissionMetadata,
  ) {
    const children = this.buildHeaderBlocks(mission, metadata);
    const properties = this.buildMissionPageProperties(mission, metadata);

    const response = await this.client.pages.create({
      parent: {
        type: "database_id",
        database_id: databaseId,
      },
      icon: {
        type: "emoji",
        emoji: "📊",
      },
      properties,
      children,
    });

    return response;
  }

  private buildMissionPageProperties(
    mission: Mission,
    metadata: MissionMetadata,
  ): PagePropertyValueMap {
    const properties: PagePropertyValueMap = {
      [MISSION_DATABASE_PROPERTY_NAMES.TITLE]: {
        title: [
          {
            type: "text",
            text: { content: `${mission.title} - 리포트` },
          },
        ],
      },
      [MISSION_DATABASE_PROPERTY_NAMES.MISSION_ID]: {
        rich_text: [
          {
            type: "text",
            text: { content: mission.id },
          },
        ],
      },
      [MISSION_DATABASE_PROPERTY_NAMES.TOTAL_RESPONSES]: {
        number: metadata.totalResponses,
      },
      [MISSION_DATABASE_PROPERTY_NAMES.COMPLETED_RESPONSES]: {
        number: metadata.completedResponses,
      },
      [MISSION_DATABASE_PROPERTY_NAMES.COMPLETION_RATE]: {
        number: metadata.completionRate,
      },
      [MISSION_DATABASE_PROPERTY_NAMES.TYPE]: {
        select: { name: metadata.type },
      },
      [MISSION_DATABASE_PROPERTY_NAMES.IS_ACTIVE]: {
        checkbox: metadata.isActive,
      },
      [MISSION_DATABASE_PROPERTY_NAMES.LAST_SYNCED_AT]: {
        date: { start: new Date().toISOString() },
      },
    };

    if (metadata.target) {
      properties[MISSION_DATABASE_PROPERTY_NAMES.TARGET] = {
        rich_text: [
          {
            type: "text",
            text: { content: metadata.target },
          },
        ],
      };
    }

    if (metadata.deadline) {
      properties[MISSION_DATABASE_PROPERTY_NAMES.DEADLINE] = {
        date: { start: metadata.deadline },
      };
    }

    if (metadata.estimatedMinutes) {
      properties[MISSION_DATABASE_PROPERTY_NAMES.ESTIMATED_MINUTES] = {
        number: metadata.estimatedMinutes,
      };
    }

    return properties;
  }

  private async updateMissionPageProperties(
    pageId: string,
    mission: Mission,
    metadata: MissionMetadata,
  ): Promise<void> {
    const properties = this.buildMissionPageProperties(mission, metadata);

    await this.client.pages.update({
      page_id: pageId,
      properties,
    });
  }

  private buildHeaderBlocks(mission: Mission, metadata: MissionMetadata): BlockObjectRequest[] {
    const blocks: BlockObjectRequest[] = [];

    if (mission.brandLogoUrl) {
      blocks.push({
        object: "block",
        type: "image",
        image: {
          type: "external",
          external: {
            url: mission.brandLogoUrl,
          },
        },
      });
    }

    blocks.push({
      object: "block",
      type: "heading_1",
      heading_1: {
        rich_text: [
          {
            type: "text",
            text: {
              content: mission.title,
            },
          },
        ],
        color: "default",
      },
    });

    if (mission.description) {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: truncateText(stripHtmlTags(mission.description), 2000),
              },
            },
          ],
          color: "default",
        },
      });
    }

    const metadataText: string[] = [];
    if (metadata.target) {
      metadataText.push(`📌 타겟: ${metadata.target}`);
    }
    if (metadata.deadline) {
      metadataText.push(`📅 마감일: ${metadata.deadline}`);
    }
    metadataText.push(`👥 총 응답자: ${metadata.totalResponses}명`);
    metadataText.push(`✅ 완주자: ${metadata.completedResponses}명`);
    metadataText.push(`📊 완주율: ${metadata.completionRate}%`);
    metadataText.push(`🏷️ 타입: ${metadata.type}`);
    if (metadata.estimatedMinutes) {
      metadataText.push(`⏱️ 예상 소요시간: ${metadata.estimatedMinutes}분`);
    }
    metadataText.push(`🔘 상태: ${metadata.isActive ? "활성" : "비활성"}`);

    blocks.push({
      object: "block",
      type: "callout",
      callout: {
        rich_text: [
          {
            type: "text",
            text: {
              content: metadataText.join("\n"),
            },
          },
        ],
        icon: {
          type: "emoji",
          emoji: "ℹ️",
        },
        color: "blue_background",
      },
    });

    blocks.push({
      object: "block",
      type: "divider",
      divider: {},
    });

    return blocks;
  }

  private async createDatabase(
    parentPageId: string,
    config: {
      title: string;
      properties: DatabasePropertyConfigMap;
      rows: Array<{ properties: PagePropertyValueMap }>;
    },
  ) {
    const database = await this.client.databases.create({
      parent: {
        type: "page_id",
        page_id: parentPageId,
      },
      title: [
        {
          type: "text",
          text: {
            content: config.title,
          },
        },
      ],
      properties: config.properties,
    });

    for (const row of config.rows) {
      await this.client.pages.create({
        parent: {
          type: "database_id",
          database_id: database.id,
        },
        properties: row.properties,
      });
    }

    return database;
  }

  private async findMissionPageInDatabase(
    databaseId: string,
    missionId: string,
  ): Promise<string | null> {
    const response = await this.client.databases.query({
      database_id: databaseId,
      filter: {
        property: MISSION_DATABASE_PROPERTY_NAMES.MISSION_ID,
        rich_text: {
          equals: missionId,
        },
      },
      page_size: 1,
    });

    const firstResult = response.results[0];
    if (firstResult) {
      return firstResult.id;
    }

    return null;
  }

  private async makePublicUrl(pageId: string): Promise<string> {
    const pageUrl = `https://notion.so/${pageId.replace(/-/g, "")}`;
    return pageUrl;
  }
}
