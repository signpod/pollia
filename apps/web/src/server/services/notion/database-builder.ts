import type { Action } from "@prisma/client";
import type {
  DatabasePropertyConfigMap,
  MissionResponseWithAnswers,
  PagePropertyValueMap,
} from "./types";
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
        const answersForAction = response.answers.filter(a => a.actionId === action.id);
        console.log("[buildResponseRowProperties] MULTIPLE_CHOICE/TAG 디버깅:", {
          actionId: action.id,
          actionTitle: action.title,
          answersCount: answersForAction.length,
          answersWithOption: answersForAction.filter(a => a.option).length,
          optionDetails: answersForAction.map(a => ({
            hasOption: !!a.option,
            optionId: a.optionId,
            optionTitle: a.option?.title,
          })),
        });
        const options = answersForAction
          .filter(a => a.option)
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
