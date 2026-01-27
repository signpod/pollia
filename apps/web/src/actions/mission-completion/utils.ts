import type { MissionCompletionData, MissionCompletionWithMission } from "@/types/dto";
import type { MissionCompletion } from "@prisma/client";

/**
 * links 필드가 Record<string, string> 형태인지 검증하는 타입 가드
 *
 * Prisma의 JsonValue 타입을 안전하게 Record<string, string>으로 변환하기 위해 사용됩니다.
 * 런타임에 실제 값이 문자열 key-value 쌍으로만 구성되어 있는지 검증합니다.
 *
 * @param value - 검증할 값 (Prisma JsonValue 타입)
 * @returns value가 Record<string, string>이면 true를 반환하고, TypeScript가 타입을 좁혀줌
 *
 * @example
 * ```typescript
 * const links: JsonValue = { homepage: "https://example.com" };
 * if (isValidLinksObject(links)) {
 *   // links는 이제 Record<string, string> 타입으로 추론됨
 *   console.log(links.homepage);
 * }
 * ```
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
 *
 * Prisma JsonValue 타입의 links를 검증하여 Record<string, string> | null로 변환합니다.
 * 잘못된 형식의 데이터는 null을 반환하고 경고 로그를 남깁니다.
 *
 * @param links - Prisma JsonValue 타입의 links 값
 * @returns 유효한 경우 Record<string, string>, null/undefined이거나 유효하지 않은 경우 null
 *
 * @example
 * ```typescript
 * const links = parseLinks({ key: "value" }); // { key: "value" }
 * const emptyLinks = parseLinks(null); // null
 * const invalidLinks = parseLinks({ key: 123 }); // null (경고 로그 출력)
 * ```
 */
function parseLinks(links: unknown): Record<string, string> | null {
  if (links === null || links === undefined) {
    return null;
  }

  if (isValidLinksObject(links)) {
    return links;
  }

  // TODO: 통합 로깅 시스템 도입 시 logger.warn으로 변경
  console.warn("[MissionCompletion] Invalid links format detected:", links);
  return null;
}

/**
 * Prisma MissionCompletion을 MissionCompletionData DTO로 변환
 *
 * Actions 레이어에서 Prisma 엔티티를 프론트엔드 친화적인 DTO로 변환할 때 사용합니다.
 * JsonValue 타입의 links 필드를 Record<string, string> | null로 안전하게 변환합니다.
 *
 * @template T - MissionCompletion과 imageFileUpload 관계를 포함하는 타입
 * @param raw - Prisma에서 조회한 MissionCompletion 데이터
 * @returns 타입 안전한 MissionCompletionData DTO
 *
 * @example
 * ```typescript
 * const completion = await missionCompletionService.getMissionCompletion(missionId);
 * return { data: toMissionCompletionData(completion) };
 * ```
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

/**
 * Prisma MissionCompletion을 MissionCompletionWithMission DTO로 변환
 *
 * mission 관계를 포함한 MissionCompletion을 DTO로 변환할 때 사용합니다.
 *
 * @template T - MissionCompletion, imageFileUpload, mission 관계를 포함하는 타입
 * @param raw - Prisma에서 조회한 MissionCompletion 데이터
 * @returns 타입 안전한 MissionCompletionWithMission DTO
 */
export function toMissionCompletionWithMission<
  T extends MissionCompletion & {
    imageFileUpload: { id: string; publicUrl: string } | null;
    mission: { id: string; creatorId: string };
  },
>(raw: T): MissionCompletionWithMission {
  return {
    ...raw,
    links: parseLinks(raw.links),
  };
}
