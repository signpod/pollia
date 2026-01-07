import type { Action } from "@prisma/client";
import type {
  DatabasePropertyConfigMap,
  MissionResponseWithAnswers,
  PagePropertyValueMap,
} from "./types";
import { AGGREGATABLE_ACTION_TYPES, EXCLUDED_ACTION_TYPES, LISTABLE_ACTION_TYPES } from "./types";
import { buildUniquePropertyName, truncateText } from "./utils";

export interface DatabaseConfig {
  title: string;
  properties: DatabasePropertyConfigMap;
  rows: DatabaseRow[];
}

export interface DatabaseRow {
  properties: PagePropertyValueMap;
}

export function buildResponseDatabase(
  actions: Action[],
  responses: MissionResponseWithAnswers[],
): DatabaseConfig {
  const properties: DatabasePropertyConfigMap = {
    응답자: { title: {} },
    "완료 시간": { date: {} },
  };

  const existingNames = new Set<string>(["응답자", "완료 시간"]);
  const actionPropertyMap = new Map<string, string>();

  actions.forEach((action, i) => {
    const propertyName = buildUniquePropertyName(action.title, i, existingNames);
    actionPropertyMap.set(action.id, propertyName);

    switch (action.type) {
      case "MULTIPLE_CHOICE":
      case "TAG":
        properties[propertyName] = { multi_select: {} };
        break;
      case "SCALE":
      case "RATING":
        properties[propertyName] = { number: {} };
        break;
      case "SUBJECTIVE":
      case "SHORT_TEXT":
        properties[propertyName] = { rich_text: {} };
        break;
      case "IMAGE":
      case "VIDEO":
      case "PDF":
        properties[propertyName] = { url: {} };
        break;
      case "DATE":
        properties[propertyName] = { date: {} };
        break;
      case "PRIVACY_CONSENT":
        properties[propertyName] = { checkbox: {} };
        break;
      default:
        properties[propertyName] = { rich_text: {} };
    }
  });

  const rows = responses.map((response, index) => ({
    properties: buildResponseRowProperties(response, actions, index + 1, actionPropertyMap),
  }));

  return {
    title: "응답 목록",
    properties,
    rows,
  };
}

function buildResponseRowProperties(
  response: MissionResponseWithAnswers,
  actions: Action[],
  index: number,
  actionPropertyMap: Map<string, string>,
): PagePropertyValueMap {
  const properties: PagePropertyValueMap = {
    응답자: {
      title: [{ type: "text", text: { content: `응답자 ${index}` } }],
    },
    "완료 시간": {
      date: response.completedAt ? { start: response.completedAt.toISOString() } : null,
    },
  };

  for (const action of actions) {
    const propertyName = actionPropertyMap.get(action.id);
    if (!propertyName) {
      continue;
    }

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
          multi_select: options.map(name => ({ name: truncateText(name, 100) })),
        };
        break;
      }
      case "SCALE":
      case "RATING":
        if (answer.scaleAnswer !== null) {
          properties[propertyName] = { number: answer.scaleAnswer };
        }
        break;
      case "SUBJECTIVE":
      case "SHORT_TEXT":
        if (answer.textAnswer) {
          properties[propertyName] = {
            rich_text: [{ type: "text", text: { content: truncateText(answer.textAnswer, 2000) } }],
          };
        }
        break;
      case "IMAGE":
      case "VIDEO":
      case "PDF": {
        const fileUpload = answer.fileUploads[0];
        if (fileUpload?.publicUrl) {
          properties[propertyName] = { url: fileUpload.publicUrl };
        }
        break;
      }
      case "DATE":
        if (answer.dateAnswers.length > 0 && answer.dateAnswers[0]) {
          const dateString = answer.dateAnswers[0].toISOString().split("T")[0];
          if (dateString) {
            properties[propertyName] = { date: { start: dateString } };
          }
        }
        break;
      case "PRIVACY_CONSENT":
        properties[propertyName] = { checkbox: answer.booleanAnswer ?? false };
        break;
    }
  }

  return properties;
}

export function buildAnalysisDatabases(
  actions: Action[],
  responses: MissionResponseWithAnswers[],
): DatabaseConfig[] {
  const databases: DatabaseConfig[] = [];

  for (const action of actions) {
    if (EXCLUDED_ACTION_TYPES.includes(action.type)) {
      continue;
    }

    if (AGGREGATABLE_ACTION_TYPES.includes(action.type)) {
      const db = buildAggregateDatabase(action, responses);
      if (db) {
        databases.push(db);
      }
    } else if (LISTABLE_ACTION_TYPES.includes(action.type)) {
      const db = buildListDatabase(action, responses);
      if (db) {
        databases.push(db);
      }
    }
  }

  return databases;
}

function buildAggregateDatabase(
  action: Action,
  responses: MissionResponseWithAnswers[],
): DatabaseConfig | null {
  if (action.type === "MULTIPLE_CHOICE" || action.type === "TAG") {
    const optionCounts = new Map<string, number>();

    for (const response of responses) {
      const answers = response.answers.filter(a => a.actionId === action.id && a.option);
      for (const answer of answers) {
        if (answer.option) {
          const optionTitle = answer.option.title;
          optionCounts.set(optionTitle, (optionCounts.get(optionTitle) || 0) + 1);
        }
      }
    }

    const sortedOptions = Array.from(optionCounts.entries()).sort((a, b) => b[1] - a[1]);
    const totalCount = Array.from(optionCounts.values()).reduce((sum, count) => sum + count, 0);

    return {
      title: action.title,
      properties: {
        선택지: { title: {} },
        개수: { number: {} },
        "비율 (%)": { number: {} },
      },
      rows: sortedOptions.map(([optionTitle, count]) => ({
        properties: {
          선택지: {
            title: [{ type: "text", text: { content: optionTitle } }],
          },
          개수: { number: count },
          "비율 (%)": {
            number: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
          },
        },
      })),
    };
  }

  if (action.type === "SCALE" || action.type === "RATING") {
    const scoreCounts = new Map<number, number>();

    for (const response of responses) {
      const answer = response.answers.find(a => a.actionId === action.id);
      if (answer?.scaleAnswer !== null && answer?.scaleAnswer !== undefined) {
        const score = answer.scaleAnswer;
        scoreCounts.set(score, (scoreCounts.get(score) || 0) + 1);
      }
    }

    const sortedScores = Array.from(scoreCounts.entries()).sort((a, b) => b[0] - a[0]);

    return {
      title: action.title,
      properties: {
        점수: { title: {} },
        개수: { number: {} },
      },
      rows: sortedScores.map(([score, count]) => ({
        properties: {
          점수: {
            title: [{ type: "text", text: { content: score.toString() } }],
          },
          개수: { number: count },
        },
      })),
    };
  }

  return null;
}

function buildListDatabase(
  action: Action,
  responses: MissionResponseWithAnswers[],
): DatabaseConfig | null {
  if (action.type === "IMAGE") {
    const rows: DatabaseRow[] = [];

    for (const response of responses) {
      const answer = response.answers.find(a => a.actionId === action.id);
      if (answer) {
        for (const fileUpload of answer.fileUploads) {
          if (fileUpload.publicUrl) {
            rows.push({
              properties: {
                이미지: {
                  title: [
                    { type: "text", text: { content: fileUpload.originalFileName || "이미지" } },
                  ],
                },
                URL: { url: fileUpload.publicUrl },
              },
            });
          }
        }
      }
    }

    if (rows.length === 0) {
      return null;
    }

    return {
      title: action.title,
      properties: {
        이미지: { title: {} },
        URL: { url: {} },
      },
      rows,
    };
  }

  if (action.type === "VIDEO" || action.type === "PDF") {
    const rows: DatabaseRow[] = [];

    for (const response of responses) {
      const answer = response.answers.find(a => a.actionId === action.id);
      if (answer) {
        for (const fileUpload of answer.fileUploads) {
          if (fileUpload.publicUrl) {
            rows.push({
              properties: {
                파일명: {
                  title: [
                    { type: "text", text: { content: fileUpload.originalFileName || "파일" } },
                  ],
                },
                URL: { url: fileUpload.publicUrl },
              },
            });
          }
        }
      }
    }

    if (rows.length === 0) {
      return null;
    }

    return {
      title: action.title,
      properties: {
        파일명: { title: {} },
        URL: { url: {} },
      },
      rows,
    };
  }

  if (action.type === "SUBJECTIVE" || action.type === "SHORT_TEXT") {
    const rows: DatabaseRow[] = [];

    for (const response of responses) {
      const answer = response.answers.find(a => a.actionId === action.id);
      if (answer?.textAnswer) {
        rows.push({
          properties: {
            응답: {
              title: [{ type: "text", text: { content: truncateText(answer.textAnswer, 100) } }],
            },
            전체내용: {
              rich_text: [
                { type: "text", text: { content: truncateText(answer.textAnswer, 2000) } },
              ],
            },
          },
        });
      }
    }

    if (rows.length === 0) {
      return null;
    }

    return {
      title: action.title,
      properties: {
        응답: { title: {} },
        전체내용: { rich_text: {} },
      },
      rows,
    };
  }

  return null;
}
