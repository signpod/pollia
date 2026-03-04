import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { missionRepository } from "@/server/repositories/mission/missionRepository";
import { AiService } from "@/server/services/ai";
import { AnthropicAiProvider } from "@/server/services/ai/anthropicClient";
import { buildSubmissionTables } from "@/server/services/submission-list";
import type { AiUsage } from "@/types/dto";
import type { ActionType } from "@prisma/client";

export interface MissionAiReportResult {
  report: string;
  usage?: AiUsage;
}

const REPORT_MAX_TOKENS = 4096;
const TEXT_SAMPLE_LIMIT = 15;
const PROMPT_CHAR_LIMIT = 8000;

export class MissionAiReportService {
  private aiService: AiService;

  constructor() {
    const provider = new AnthropicAiProvider(null, undefined, REPORT_MAX_TOKENS);
    this.aiService = new AiService(provider);
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

    const prompt = buildPrompt(mission.title, completedRows.length, responses.length, aggregated);
    const result = await this.aiService.generateMarkdown(prompt);

    await missionRepository.update(missionId, {
      aiStatisticsReport: result.result,
    });

    return { report: result.result, usage: result.usage };
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

function buildPrompt(
  missionTitle: string,
  completedCount: number,
  totalCount: number,
  columns: AggregatedColumn[],
): string {
  const header = [
    `미션 제목: ${missionTitle}`,
    `총 참여자: ${totalCount}명, 완료자: ${completedCount}명`,
    "",
    "질문별 응답 집계:",
  ].join("\n");

  const body = columns.map(col => `[${col.title}] (${col.type})\n${col.summary}`).join("\n\n");

  let prompt = `${header}\n\n${body}`;
  if (prompt.length > PROMPT_CHAR_LIMIT) {
    prompt = `${prompt.slice(0, PROMPT_CHAR_LIMIT)}\n...(일부 생략)`;
  }

  return [
    "아래 미션 응답 데이터를 분석하여 한국어로 통계 리포트를 작성해주세요.",
    "핵심 인사이트, 질문별 경향성, 주목할 패턴을 포함해주세요.",
    "마크다운 형식으로 작성해주세요. 제목(##, ###), 굵은 글씨(**), 목록(-, 1.) 등을 활용해주세요.",
    "",
    prompt,
  ].join("\n");
}

export const missionAiReportService = new MissionAiReportService();
