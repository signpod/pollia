import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { buildSubmissionTables } from "@/server/services/submission-list";
import type {
  ActionStatItem,
  ChoiceActionStats,
  CountOnlyActionStats,
  ScaleActionStats,
  TextActionStats,
} from "@/types/dto/action-stats";

const TEXT_SAMPLE_LIMIT = 50;

export async function getActionStats(missionId: string): Promise<ActionStatItem[]> {
  const [actions, responses] = await Promise.all([
    actionRepository.findDetailsByMissionId(missionId),
    missionResponseRepository.findByMissionId(missionId),
  ]);

  if (actions.length === 0) return [];

  const { columns, completedRows } = buildSubmissionTables({ actions, responses });

  return columns.map((col, colIndex) => {
    const values = completedRows
      .map(row => row.answers[colIndex]?.value)
      .filter((v): v is string => v !== null);

    const base = {
      actionId: col.id,
      title: col.title,
      actionType: col.type,
      totalResponses: values.length,
    };

    switch (col.type) {
      case "MULTIPLE_CHOICE":
      case "TAG":
      case "BRANCH":
        return buildChoiceStats(base, values);
      case "SCALE":
      case "RATING":
        return buildScaleStats(base, values);
      case "SUBJECTIVE":
      case "SHORT_TEXT":
        return buildTextStats(base, values);
      default:
        return { ...base, type: "count" } satisfies CountOnlyActionStats;
    }
  });
}

function buildChoiceStats(
  base: Omit<ChoiceActionStats, "type" | "options">,
  values: string[],
): ChoiceActionStats {
  const countMap = new Map<string, number>();
  for (const raw of values) {
    for (const label of raw.split(", ")) {
      const trimmed = label.trim();
      if (trimmed) {
        countMap.set(trimmed, (countMap.get(trimmed) ?? 0) + 1);
      }
    }
  }

  const total = base.totalResponses || 1;
  const options = [...countMap.entries()]
    .map(([label, count]) => ({
      label,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count);

  return { ...base, type: "choice", options };
}

function buildScaleStats(
  base: Omit<ScaleActionStats, "type" | "distribution" | "mean" | "median" | "min" | "max">,
  values: string[],
): ScaleActionStats {
  const scores = values.map(Number).filter(n => !Number.isNaN(n));

  if (scores.length === 0) {
    return { ...base, type: "scale", distribution: [], mean: 0, median: 0, min: 0, max: 0 };
  }

  scores.sort((a, b) => a - b);

  const distMap = new Map<number, number>();
  for (const s of scores) {
    distMap.set(s, (distMap.get(s) ?? 0) + 1);
  }
  const distribution = [...distMap.entries()]
    .map(([score, count]) => ({ score, count }))
    .sort((a, b) => a.score - b.score);

  const sum = scores.reduce((a, b) => a + b, 0);
  const mean = Math.round((sum / scores.length) * 100) / 100;
  const mid = Math.floor(scores.length / 2);
  const median =
    scores.length % 2 === 0
      ? Math.round(((scores[mid - 1]! + scores[mid]!) / 2) * 100) / 100
      : scores[mid]!;

  return {
    ...base,
    type: "scale",
    distribution,
    mean,
    median,
    min: scores[0]!,
    max: scores[scores.length - 1]!,
  };
}

function buildTextStats(
  base: Omit<TextActionStats, "type" | "samples" | "hasMore">,
  values: string[],
): TextActionStats {
  return {
    ...base,
    type: "text",
    samples: values.slice(0, TEXT_SAMPLE_LIMIT),
    hasMore: values.length > TEXT_SAMPLE_LIMIT,
  };
}
