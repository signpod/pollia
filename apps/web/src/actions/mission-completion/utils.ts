import type { MissionCompletionData } from "@/types/dto";
import type { MissionCompletion } from "@prisma/client";

/**
 * links 필드가 Record<string, string> 형태인지 검증
 */
function isValidLinksObject(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).every(
    ([key, val]) => typeof key === "string" && typeof val === "string",
  );
}

/**
 * MissionCompletion의 links를 안전하게 파싱
 */
function parseLinks(links: unknown): Record<string, string> | null {
  if (links === null || links === undefined) {
    return null;
  }

  if (isValidLinksObject(links)) {
    return links;
  }

  console.warn("Invalid links format:", links);
  return null;
}

/**
 * Prisma MissionCompletion을 MissionCompletionData DTO로 변환
 */
export function toMissionCompletionData<
  T extends MissionCompletion & {
    imageFileUpload: { id: string; publicUrl: string } | null;
  },
>(raw: T): MissionCompletionData {
  return {
    ...raw,
    links: parseLinks(raw.links),
  };
}
