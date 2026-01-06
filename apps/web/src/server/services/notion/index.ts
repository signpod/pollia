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
    if (actions.length === 0) {
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
                  content: "📊 질문별 분석",
                },
              },
            ],
          },
        },
      ],
    });

    for (const action of actions) {
      await this.appendActionAnalysis(pageId, action, responses);
    }
  }

  private async appendActionAnalysis(
    pageId: string,
    action: Action,
    responses: MissionResponseWithAnswers[],
  ): Promise<void> {
    const { AGGREGATABLE_ACTION_TYPES, LISTABLE_ACTION_TYPES, EXCLUDED_ACTION_TYPES } =
      await import("./types");

    if (EXCLUDED_ACTION_TYPES.includes(action.type)) {
      return;
    }

    const blocks: BlockObjectRequest[] = [];

    blocks.push({
      object: "block",
      type: "heading_3",
      heading_3: {
        rich_text: [
          {
            type: "text",
            text: {
              content: action.title,
            },
          },
        ],
      },
    });

    if (action.description) {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: action.description,
              },
            },
          ],
        },
      });
    }

    if (AGGREGATABLE_ACTION_TYPES.includes(action.type)) {
      const analysisBlocks = await this.buildAggregateAnalysis(action, responses);
      blocks.push(...analysisBlocks);
    } else if (LISTABLE_ACTION_TYPES.includes(action.type)) {
      const listBlocks = await this.buildListAnalysis(action, responses);
      blocks.push(...listBlocks);
    }

    blocks.push({
      object: "block",
      type: "divider",
      divider: {},
    });

    await this.client.blocks.children.append({
      block_id: pageId,
      children: blocks,
    });
  }

  private async buildAggregateAnalysis(
    action: Action,
    responses: MissionResponseWithAnswers[],
  ): Promise<BlockObjectRequest[]> {
    const blocks: BlockObjectRequest[] = [];

    if (action.type === "MULTIPLE_CHOICE" || action.type === "TAG") {
      const optionCounts = new Map<string, number>();
      let totalCount = 0;

      for (const response of responses) {
        const answers = response.answers.filter(a => a.actionId === action.id && a.option);
        for (const answer of answers) {
          if (answer.option) {
            const optionTitle = answer.option.title;
            optionCounts.set(optionTitle, (optionCounts.get(optionTitle) || 0) + 1);
            totalCount++;
          }
        }
      }

      const sortedOptions = Array.from(optionCounts.entries()).sort((a, b) => b[1] - a[1]);

      for (const [optionTitle, count] of sortedOptions) {
        const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : "0.0";
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: `${optionTitle}: ${count}회 (${percentage}%)`,
                },
              },
            ],
          },
        });
      }
    } else if (action.type === "SCALE" || action.type === "RATING") {
      const values: number[] = [];

      for (const response of responses) {
        const answer = response.answers.find(a => a.actionId === action.id);
        if (answer?.scaleAnswer !== null && answer?.scaleAnswer !== undefined) {
          values.push(answer.scaleAnswer);
        }
      }

      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        const average = (sum / values.length).toFixed(2);
        const min = Math.min(...values);
        const max = Math.max(...values);

        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: `평균: ${average} | 최소: ${min} | 최대: ${max} | 응답 수: ${values.length}`,
                },
              },
            ],
          },
        });
      }
    }

    return blocks;
  }

  private async buildListAnalysis(
    action: Action,
    responses: MissionResponseWithAnswers[],
  ): Promise<BlockObjectRequest[]> {
    const blocks: BlockObjectRequest[] = [];
    let itemCount = 0;

    for (const response of responses) {
      const answer = response.answers.find(a => a.actionId === action.id);
      if (!answer) continue;

      if (action.type === "IMAGE" || action.type === "VIDEO" || action.type === "PDF") {
        for (const fileUpload of answer.fileUploads) {
          if (fileUpload.url) {
            itemCount++;
            if (action.type === "IMAGE") {
              blocks.push({
                object: "block",
                type: "image",
                image: {
                  type: "external",
                  external: {
                    url: fileUpload.url,
                  },
                },
              });
            } else {
              blocks.push({
                object: "block",
                type: "paragraph",
                paragraph: {
                  rich_text: [
                    {
                      type: "text",
                      text: {
                        content: fileUpload.filename || "파일",
                        link: {
                          url: fileUpload.url,
                        },
                      },
                    },
                  ],
                },
              });
            }
          }
        }
      } else if (action.type === "SUBJECTIVE" || action.type === "SHORT_TEXT") {
        if (answer.textAnswer) {
          itemCount++;
          blocks.push({
            object: "block",
            type: "callout",
            callout: {
              icon: {
                type: "emoji",
                emoji: "💬",
              },
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: this.truncateText(answer.textAnswer, 2000),
                  },
                },
              ],
            },
          });
        }
      }
    }

    if (itemCount === 0) {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "응답 없음",
              },
            },
          ],
        },
      });
    }

    return blocks;
  }

  private async makePublicUrl(pageId: string): Promise<string> {
    const cleanPageId = pageId.replace(/-/g, "");
    return `https://notion.so/${cleanPageId}`;
  }
}

export const notionService = new NotionService();
