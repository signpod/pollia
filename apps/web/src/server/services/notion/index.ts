import { Client } from "@notionhq/client";
import type { Action, Mission } from "@prisma/client";
import type {
  BlockObjectRequest,
  CreateMissionReportInput,
  CreateMissionReportResult,
  MissionResponseWithAnswers,
} from "./types";

export class NotionService {
  private client: Client;

  constructor(private notionClient?: Client) {
    this.client =
      notionClient ||
      new Client({
        auth: process.env.NOTION_API_KEY,
      });
  }

  async createOrUpdateMissionReport(
    input: CreateMissionReportInput,
  ): Promise<CreateMissionReportResult> {
    const { mission, responses, actions } = input;

    const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
    if (!parentPageId) {
      const error = new Error("NOTION_PARENT_PAGE_ID 환경변수가 설정되지 않았습니다.");
      error.cause = 500;
      throw error;
    }

    const page = await this.createPageStructure(mission, parentPageId);
    const notionPageId = page.id;

    await this.createResponseDatabase(notionPageId, responses, actions);

    await this.createAnalysisSection(notionPageId, responses, actions);

    const publicUrl = await this.makePublicUrl(notionPageId);

    return {
      notionPageId,
      notionPageUrl: publicUrl,
    };
  }

  private async createPageStructure(mission: Mission, parentPageId: string) {
    const response = await this.client.pages.create({
      parent: {
        type: "page_id",
        page_id: parentPageId,
      },
      icon: {
        type: "emoji",
        emoji: "📊",
      },
      properties: {
        title: {
          title: [
            {
              type: "text",
              text: {
                content: `${mission.title} - 리포트`,
              },
            },
          ],
        },
      },
      children: await this.buildHeaderBlocks(mission),
    });

    return response;
  }

  private async buildHeaderBlocks(mission: Mission): Promise<BlockObjectRequest[]> {
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
                content: mission.description.replace(/<[^>]*>/g, ""),
              },
            },
          ],
        },
      });
    }

    blocks.push({
      object: "block",
      type: "divider",
      divider: {},
    });

    return blocks;
  }

  private async createResponseDatabase(
    pageId: string,
    responses: MissionResponseWithAnswers[],
    actions: Action[],
  ): Promise<void> {
    if (responses.length === 0) {
      return;
    }

    await this.client.blocks.children.append({
      block_id: pageId,
      children: [
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: "📋 응답자 데이터",
                },
              },
            ],
          },
        },
      ],
    });

    const databaseProperties: Record<
      string,
      | { title: Record<string, never> }
      | { multi_select: Record<string, never> }
      | { number: Record<string, never> }
      | { rich_text: Record<string, never> }
      | { url: Record<string, never> }
      | { date: Record<string, never> }
      | { checkbox: Record<string, never> }
    > = {
      응답자: {
        title: {},
      },
      "완료 시간": {
        date: {},
      },
    };

    for (const action of actions) {
      const propertyName = this.truncateText(action.title, 100);

      switch (action.type) {
        case "MULTIPLE_CHOICE":
        case "TAG":
          databaseProperties[propertyName] = { multi_select: {} };
          break;
        case "SCALE":
        case "RATING":
          databaseProperties[propertyName] = { number: {} };
          break;
        case "SUBJECTIVE":
        case "SHORT_TEXT":
          databaseProperties[propertyName] = { rich_text: {} };
          break;
        case "IMAGE":
        case "VIDEO":
        case "PDF":
          databaseProperties[propertyName] = { url: {} };
          break;
        case "DATE":
          databaseProperties[propertyName] = { date: {} };
          break;
        case "PRIVACY_CONSENT":
          databaseProperties[propertyName] = { checkbox: {} };
          break;
        default:
          databaseProperties[propertyName] = { rich_text: {} };
      }
    }

    const database = await this.client.databases.create({
      parent: {
        type: "page_id",
        page_id: pageId,
      },
      title: [
        {
          type: "text",
          text: {
            content: "응답 목록",
          },
        },
      ],
      properties: databaseProperties,
    });

    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      if (response) {
        await this.insertResponseRow(database.id, response, actions, i + 1);
      }
    }
  }

  private async insertResponseRow(
    databaseId: string,
    response: MissionResponseWithAnswers,
    actions: Action[],
    index: number,
  ): Promise<void> {
    const properties: Record<
      string,
      | { title: Array<{ type: "text"; text: { content: string } }> }
      | { date: { start: string } | null }
      | { multi_select: Array<{ name: string }> }
      | { number: number }
      | { rich_text: Array<{ type: "text"; text: { content: string } }> }
      | { url: string }
      | { checkbox: boolean }
    > = {
      응답자: {
        title: [
          {
            type: "text",
            text: {
              content: `응답자 ${index}`,
            },
          },
        ],
      },
      "완료 시간": {
        date: response.completedAt
          ? {
              start: response.completedAt.toISOString(),
            }
          : null,
      },
    };

    for (const action of actions) {
      const propertyName = this.truncateText(action.title, 100);
      const answer = response.answers.find(a => a.actionId === action.id);

      if (!answer) {
        continue;
      }

      switch (action.type) {
        case "MULTIPLE_CHOICE":
        case "TAG": {
          const options = response.answers
            .filter(a => a.actionId === action.id && a.option)
            .map(a => {
              if (!a.option) return "";
              return a.option.title;
            })
            .filter(title => title !== "");
          properties[propertyName] = {
            multi_select: options.map(name => ({ name: this.truncateText(name, 100) })),
          };
          break;
        }
        case "SCALE":
        case "RATING":
          if (answer.scaleAnswer !== null) {
            properties[propertyName] = {
              number: answer.scaleAnswer,
            };
          }
          break;
        case "SUBJECTIVE":
        case "SHORT_TEXT":
          if (answer.textAnswer) {
            properties[propertyName] = {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: this.truncateText(answer.textAnswer, 2000),
                  },
                },
              ],
            };
          }
          break;
        case "IMAGE":
        case "VIDEO":
        case "PDF": {
          const fileUpload = answer.fileUploads[0];
          if (fileUpload?.url) {
            properties[propertyName] = {
              url: fileUpload.url,
            };
          }
          break;
        }
        case "DATE":
          if (answer.dateAnswers.length > 0 && answer.dateAnswers[0]) {
            const dateString = answer.dateAnswers[0].toISOString().split("T")[0];
            if (dateString) {
              properties[propertyName] = {
                date: {
                  start: dateString,
                },
              };
            }
          }
          break;
        case "PRIVACY_CONSENT":
          properties[propertyName] = {
            checkbox: answer.booleanAnswer ?? false,
          };
          break;
      }
    }

    await this.client.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties,
    });
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 3)}...`;
  }

  private async createAnalysisSection(
    pageId: string,
    responses: MissionResponseWithAnswers[],
    actions: Action[],
  ): Promise<void> {
    // TODO: 구현 예정
  }

  private async makePublicUrl(pageId: string): Promise<string> {
    // TODO: 공개 링크 생성 구현
    return `https://notion.so/${pageId.replace(/-/g, "")}`;
  }
}

export const notionService = new NotionService();
