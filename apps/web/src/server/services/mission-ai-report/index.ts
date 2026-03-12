import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionCompletionStatRepository } from "@/server/repositories/mission-completion-stat/missionCompletionStatRepository";
import { missionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import { trackingActionEntryRepository } from "@/server/repositories/tracking-action-entry/trackingActionEntryRepository";
import { trackingActionResponseRepository } from "@/server/repositories/tracking-action-response/trackingActionResponseRepository";
import { AnthropicAiProvider } from "@/server/services/ai/anthropicClient";
import { buildSubmissionTables } from "@/server/services/submission-list";
import type { SubmissionRow } from "@/server/services/submission-list";
import type { AiReportAiAnalysis, AiReportData, AiUsage } from "@/types/dto";
import type { ActionType } from "@prisma/client";

export interface MissionAiReportResult {
  reportData: AiReportData;
  usage?: AiUsage;
}

const REPORT_MAX_TOKENS = 4096;
const TEXT_SAMPLE_LIMIT = 15;
const PROMPT_CHAR_LIMIT = 8000;

export class MissionAiReportService {
  private provider: AnthropicAiProvider;

  constructor() {
    this.provider = new AnthropicAiProvider(null, undefined, REPORT_MAX_TOKENS);
  }

  async generate(missionId: string, userId: string): Promise<MissionAiReportResult> {
    const mission = await missionRepository.findById(missionId);
    if (!mission) {
      const error = new Error("미션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    if (mission.creatorId !== userId) {
      const error = new Error("미션에 대한 접근 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    const [responses, actions] = await Promise.all([
      missionResponseRepository.findByMissionId(missionId),
      actionRepository.findDetailsByMissionId(missionId),
    ]);

    if (responses.length === 0) {
      const error = new Error("분석할 응답 데이터가 없습니다.");
      error.cause = 400;
      throw error;
    }

    const { completedRows, columns } = buildSubmissionTables({ actions, responses });

    const stats = await this.buildStats(
      mission,
      missionId,
      responses,
      completedRows,
      columns,
      actions,
    );

    const aggregated = columns.map(column => {
      const values = completedRows
        .map(row => row.answers.find(a => a.actionId === column.id)?.value)
        .filter((v): v is string => v !== null && v !== undefined);

      return {
        title: column.title,
        type: column.type,
        summary: aggregateByType(column.type, values),
      };
    });

    const prompt = buildPrompt(
      mission.title,
      completedRows.length,
      responses.length,
      aggregated,
      stats,
    );

    const result = await this.provider.generateText({
      systemPrompt: buildSystemPrompt(),
      userPrompt: prompt,
    });

    const ai = parseAiResponse(result.text);

    const reportData: AiReportData = {
      version: 2,
      generatedAt: new Date().toISOString(),
      stats,
      ai,
    };

    await missionRepository.update(missionId, {
      aiStatisticsReport: JSON.stringify(reportData),
    });

    return { reportData, usage: result.usage };
  }

  private async buildStats(
    mission: { title: string; startDate: Date | null; deadline: Date | null; shareCount: number },
    missionId: string,
    responses: Array<{ startedAt: Date; completedAt: Date | null }>,
    completedRows: SubmissionRow[],
    columns: Array<{ id: string; title: string; type: ActionType }>,
    actions: Array<{ id: string; title: string; type: ActionType }>,
  ): Promise<AiReportData["stats"]> {
    const totalParticipants = responses.length;
    const completedCount = completedRows.length;
    const completionRate = totalParticipants > 0 ? (completedCount / totalParticipants) * 100 : 0;

    const durations = completedRows
      .filter((r): r is typeof r & { completedAt: Date } => r.completedAt !== null)
      .map(r => (new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime()) / 1000);
    const avgDurationSeconds =
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : null;

    const dailyTrendMap = new Map<string, number>();
    for (const r of responses) {
      if (r.completedAt) {
        const dateStr = new Date(r.completedAt).toISOString().split("T")[0] ?? "";
        dailyTrendMap.set(dateStr, (dailyTrendMap.get(dateStr) ?? 0) + 1);
      }
    }
    const dailyTrend = [...dailyTrendMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const [trackingEntries, trackingResponses] = await Promise.all([
      trackingActionEntryRepository.findByMissionId(missionId),
      trackingActionResponseRepository.findByMissionId(missionId),
    ]);

    const funnel = actions.map(action => {
      const entryCount = trackingEntries.filter(e => e.actionId === action.id).length;
      const responseCount = trackingResponses.filter(r => r.actionId === action.id).length;
      return {
        actionId: action.id,
        actionTitle: action.title,
        entryCount,
        responseCount,
      };
    });

    const multipleChoice = columns
      .filter(col => col.type === "MULTIPLE_CHOICE" || col.type === "TAG")
      .map(col => {
        const values = completedRows
          .map(row => row.answers.find(a => a.actionId === col.id)?.value)
          .filter((v): v is string => v !== null && v !== undefined);

        const freq = new Map<string, number>();
        for (const v of values) {
          for (const option of v.split(", ")) {
            const trimmed = option.trim();
            if (trimmed) {
              freq.set(trimmed, (freq.get(trimmed) ?? 0) + 1);
            }
          }
        }

        const responsesSorted = [...freq.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => ({ label, count }));

        return {
          actionId: col.id,
          title: col.title,
          responses: responsesSorted,
        };
      });

    const completionStats = await missionCompletionStatRepository.findByMissionId(missionId);
    const totalEncounters = completionStats.reduce((sum, s) => sum + s.encounterCount, 0);
    const resultDistribution = completionStats.map(stat => ({
      completionId: stat.missionCompletionId,
      title: stat.missionCompletion.title,
      count: stat.encounterCount,
      rate: totalEncounters > 0 ? (stat.encounterCount / totalEncounters) * 100 : 0,
    }));

    return {
      cover: {
        missionTitle: mission.title,
        startDate: mission.startDate?.toISOString() ?? null,
        endDate: mission.deadline?.toISOString() ?? null,
      },
      kpis: {
        totalParticipants,
        completionRate,
        avgDurationSeconds,
        shareCount: mission.shareCount,
      },
      dailyTrend,
      funnel,
      multipleChoice,
      resultDistribution,
    };
  }
}

interface AggregatedColumn {
  title: string;
  type: ActionType;
  summary: string;
}

function aggregateByType(type: ActionType, values: string[]): string {
  if (values.length === 0) return "응답 없음";

  switch (type) {
    case "MULTIPLE_CHOICE":
    case "TAG":
    case "BRANCH":
      return aggregateFrequency(values);
    case "SCALE":
    case "RATING":
      return aggregateNumeric(values);
    case "SUBJECTIVE":
    case "SHORT_TEXT":
      return aggregateText(values);
    case "IMAGE":
    case "VIDEO":
    case "PDF":
      return `파일 응답 ${values.length}건`;
    case "DATE":
    case "TIME":
      return `응답 ${values.length}건`;
    default:
      return aggregateText(values);
  }
}

function aggregateFrequency(values: string[]): string {
  const freq = new Map<string, number>();
  for (const v of values) {
    for (const option of v.split(", ")) {
      const trimmed = option.trim();
      if (trimmed) {
        freq.set(trimmed, (freq.get(trimmed) ?? 0) + 1);
      }
    }
  }

  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  return sorted.map(([option, count]) => `${option}: ${count}명`).join(", ");
}

function aggregateNumeric(values: string[]): string {
  const nums = values.map(Number).filter(n => !Number.isNaN(n));
  if (nums.length === 0) return "유효한 수치 없음";

  nums.sort((a, b) => a - b);
  const min = nums[0] as number;
  const max = nums[nums.length - 1] as number;
  const mean = nums.reduce((sum, n) => sum + n, 0) / nums.length;
  const mid = Math.floor(nums.length / 2);
  const median =
    nums.length % 2 !== 0
      ? (nums[mid] as number)
      : ((nums[mid - 1] as number) + (nums[mid] as number)) / 2;

  return `최솟값: ${min}, 최댓값: ${max}, 평균: ${mean.toFixed(1)}, 중앙값: ${median}`;
}

function aggregateText(values: string[]): string {
  const samples = values.slice(0, TEXT_SAMPLE_LIMIT);
  const lines = samples.map((v, i) => `  ${i + 1}. "${v}"`).join("\n");
  const suffix =
    values.length > TEXT_SAMPLE_LIMIT ? `\n  (외 ${values.length - TEXT_SAMPLE_LIMIT}건)` : "";
  return `총 ${values.length}건\n${lines}${suffix}`;
}

function buildSystemPrompt(): string {
  return [
    "너는 미션/설문 데이터를 분석하는 AI 도우미다.",
    "반드시 아래 JSON 형식으로만 응답한다. JSON 외 텍스트나 코드블록은 절대 포함하지 않는다.",
    "",
    '{"summary":"3줄 핵심 요약","dropOffAnalysis":"퍼널 이탈 분석 코멘트","subjective":{"topKeywords":[{"keyword":"키워드","count":5}],"sentiment":{"positive":0.6,"neutral":0.3,"negative":0.1},"summary":"주관식 분석 요약"},"insights":["인사이트1","인사이트2","인사이트3"],"suggestions":["제안1","제안2","제안3"]}',
    "",
    "규칙:",
    "- summary: 전체 데이터의 핵심을 3문장으로 요약",
    "- dropOffAnalysis: 퍼널 데이터를 보고 어디서 이탈이 크고 왜 그런지 분석",
    "- subjective.topKeywords: 주관식 텍스트에서 자주 등장하는 키워드 5~10개와 빈도",
    "- subjective.sentiment: 주관식 텍스트의 긍정/중립/부정 비율 (합계 1.0)",
    "- subjective.summary: 주관식 응답의 전반적 경향 요약",
    "- insights: 데이터에서 발견한 주목할 만한 패턴 3개",
    "- suggestions: 미션 개선을 위한 구체적 제안 3개",
    "- 주관식 텍스트가 없으면 subjective 필드는 빈 키워드, 균등 감성, 빈 요약으로 채워라",
    "- 모든 텍스트는 한국어로 작성",
  ].join("\n");
}

function buildPrompt(
  missionTitle: string,
  completedCount: number,
  totalCount: number,
  columns: AggregatedColumn[],
  stats: AiReportData["stats"],
): string {
  const header = [
    `미션 제목: ${missionTitle}`,
    `총 참여자: ${totalCount}명, 완료자: ${completedCount}명`,
    `완주율: ${stats.kpis.completionRate.toFixed(1)}%`,
    stats.kpis.avgDurationSeconds
      ? `평균 소요 시간: ${Math.round(stats.kpis.avgDurationSeconds)}초`
      : "",
    "",
    "일별 참여 추이:",
    stats.dailyTrend.map(d => `  ${d.date}: ${d.count}명`).join("\n"),
    "",
    "액션별 퍼널 (진입 → 응답):",
    stats.funnel.map(f => `  ${f.actionTitle}: ${f.entryCount} → ${f.responseCount}`).join("\n"),
    "",
    "질문별 응답 집계:",
  ].join("\n");

  const body = columns.map(col => `[${col.title}] (${col.type})\n${col.summary}`).join("\n\n");

  let prompt = `${header}\n\n${body}`;
  if (prompt.length > PROMPT_CHAR_LIMIT) {
    prompt = `${prompt.slice(0, PROMPT_CHAR_LIMIT)}\n...(일부 생략)`;
  }

  return prompt;
}

function parseAiResponse(text: string): AiReportAiAnalysis {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonStr = fenced?.[1]?.trim() || trimmed;

  try {
    const parsed = JSON.parse(jsonStr) as AiReportAiAnalysis;

    return {
      summary: parsed.summary ?? "",
      dropOffAnalysis: parsed.dropOffAnalysis ?? "",
      subjective: {
        topKeywords: Array.isArray(parsed.subjective?.topKeywords)
          ? parsed.subjective.topKeywords
          : [],
        sentiment: {
          positive: parsed.subjective?.sentiment?.positive ?? 0.33,
          neutral: parsed.subjective?.sentiment?.neutral ?? 0.34,
          negative: parsed.subjective?.sentiment?.negative ?? 0.33,
        },
        summary: parsed.subjective?.summary ?? "",
      },
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch {
    return {
      summary: text.slice(0, 500),
      dropOffAnalysis: "",
      subjective: {
        topKeywords: [],
        sentiment: { positive: 0.33, neutral: 0.34, negative: 0.33 },
        summary: "",
      },
      insights: [],
      suggestions: [],
    };
  }
}

export const missionAiReportService = new MissionAiReportService();
