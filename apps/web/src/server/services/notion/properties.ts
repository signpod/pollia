import type { Mission } from "@prisma/client";
import type { MissionResponseWithAnswers, PagePropertyValueMap } from "./types";

export function buildPageProperties(
  mission: Mission,
  responses: MissionResponseWithAnswers[],
): PagePropertyValueMap {
  const totalResponses = responses.length;
  const completedResponses = responses.filter(r => r.completedAt !== null).length;
  const completionRate =
    totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

  const properties: PagePropertyValueMap = {
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
    "총 응답자": {
      number: totalResponses,
    },
    완주자: {
      number: completedResponses,
    },
    "완주율 (%)": {
      number: completionRate,
    },
    타입: {
      select: {
        name: mission.type === "GENERAL" ? "일반" : "체험단",
      },
    },
    상태: {
      select: {
        name: mission.isActive ? "활성" : "비활성",
      },
    },
  };

  if (mission.target) {
    properties.타겟 = {
      rich_text: [
        {
          type: "text",
          text: {
            content: mission.target,
          },
        },
      ],
    };
  }

  if (mission.deadline) {
    const deadlineDate = mission.deadline.toISOString().split("T")[0];
    if (deadlineDate) {
      properties.마감일 = {
        date: {
          start: deadlineDate,
        },
      };
    }
  }

  if (mission.estimatedMinutes) {
    properties["예상 소요시간"] = {
      number: mission.estimatedMinutes,
    };
  }

  return properties;
}
