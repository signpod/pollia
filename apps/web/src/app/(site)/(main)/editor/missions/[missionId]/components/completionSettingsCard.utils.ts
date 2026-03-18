import type {
  GetMissionCompletionsResponse,
  MissionCompletionData,
  MissionCompletionWithMission,
} from "@/types/dto";
import type { CompletionFormRawSnapshot, CompletionFormValues } from "./CompletionForm";

export { createDraftKey } from "./editorDraftKey";

export function getExistingItemKey(completionId: string) {
  return `existing:${completionId}`;
}

export function mapEditInitialValues(
  completion: MissionCompletionWithMission,
): CompletionFormValues {
  return {
    title: completion.title,
    description: completion.description,
    imageUrl: completion.imageUrl ?? null,
    imageFileUploadId: completion.imageFileUploadId ?? null,
    links: completion.links.map(link => ({
      name: link.name,
      url: link.url,
      order: link.order,
      imageUrl: link.imageUrl,
      fileUploadId: link.fileUploadId,
    })),
    minScoreRatio: completion.minScoreRatio ?? null,
    maxScoreRatio: completion.maxScoreRatio ?? null,
  };
}

function normalizeValues(values: CompletionFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    imageUrl: values.imageUrl ?? null,
    imageFileUploadId: values.imageFileUploadId ?? null,
    links: values.links ?? [],
    minScoreRatio: values.minScoreRatio ?? null,
    maxScoreRatio: values.maxScoreRatio ?? null,
  };
}

export function areCompletionSnapshotsEqual(
  left: CompletionFormRawSnapshot | undefined,
  right: CompletionFormRawSnapshot,
) {
  if (!left) {
    return false;
  }

  return (
    left.title === right.title &&
    left.description === right.description &&
    (left.imageUrl ?? null) === (right.imageUrl ?? null) &&
    (left.imageFileUploadId ?? null) === (right.imageFileUploadId ?? null) &&
    JSON.stringify(left.links) === JSON.stringify(right.links) &&
    (left.minScoreRatio ?? null) === (right.minScoreRatio ?? null) &&
    (left.maxScoreRatio ?? null) === (right.maxScoreRatio ?? null)
  );
}

export function isCompletionChanged(
  completion: MissionCompletionWithMission,
  values: CompletionFormValues,
): boolean {
  const current = normalizeValues(values);
  const initial = normalizeValues(mapEditInitialValues(completion));
  return JSON.stringify(current) !== JSON.stringify(initial);
}

export function toDateOrFallback(value: unknown, fallback: Date): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
}

export function buildPatchedCompletionForCache(params: {
  currentCompletion: MissionCompletionWithMission | null;
  serverData: MissionCompletionData;
  missionId: string;
  missionMeta: MissionCompletionWithMission["mission"] | null;
}): MissionCompletionWithMission {
  const { currentCompletion, serverData, missionId, missionMeta } = params;
  const now = new Date();

  return {
    id: serverData.id,
    title: serverData.title,
    description: serverData.description,
    imageUrl: serverData.imageUrl ?? null,
    links: serverData.links ?? [],
    missionId: serverData.missionId ?? currentCompletion?.missionId ?? missionId,
    imageFileUploadId: serverData.imageFileUploadId ?? null,
    minScoreRatio: serverData.minScoreRatio ?? currentCompletion?.minScoreRatio ?? null,
    maxScoreRatio: serverData.maxScoreRatio ?? currentCompletion?.maxScoreRatio ?? null,
    createdAt: toDateOrFallback(serverData.createdAt ?? currentCompletion?.createdAt, now),
    updatedAt: toDateOrFallback(serverData.updatedAt ?? currentCompletion?.updatedAt, now),
    imageFileUpload: serverData.imageFileUpload ?? currentCompletion?.imageFileUpload ?? null,
    mission: currentCompletion?.mission ?? missionMeta ?? { id: missionId, creatorId: "" },
  };
}

export function patchCompletionsQueryData(
  previous: GetMissionCompletionsResponse | undefined,
  params: {
    upserts: MissionCompletionWithMission[];
    removeIds: Set<string>;
  },
): GetMissionCompletionsResponse | undefined {
  const { upserts, removeIds } = params;
  if (
    !previous ||
    !Array.isArray(previous.data) ||
    (upserts.length === 0 && removeIds.size === 0)
  ) {
    return previous;
  }

  const byId = new Map(previous.data.map(completion => [completion.id, completion]));
  for (const completionId of removeIds) {
    byId.delete(completionId);
  }
  for (const completion of upserts) {
    byId.set(completion.id, completion);
  }

  const nextData = [...byId.values()].sort(
    (left, right) =>
      toDateOrFallback(left.createdAt, new Date(0)).getTime() -
      toDateOrFallback(right.createdAt, new Date(0)).getTime(),
  );

  return { ...previous, data: nextData };
}

export function computeScoreRatiosFromThresholds(
  thresholds: number[],
  count: number,
): Array<{ minScoreRatio: number; maxScoreRatio: number }> {
  if (count === 0) return [];
  if (count === 1) return [{ minScoreRatio: 0, maxScoreRatio: 100 }];

  const result: Array<{ minScoreRatio: number; maxScoreRatio: number }> = [];
  for (let i = 0; i < count; i++) {
    const min = i === 0 ? 0 : (thresholds[i - 1] ?? 0);
    const max = i === count - 1 ? 100 : (thresholds[i] ?? 100) - 1;
    result.push({ minScoreRatio: min, maxScoreRatio: max });
  }
  return result;
}

export function distributeThresholdsEvenly(count: number): number[] {
  if (count <= 1) return [];
  const thresholds: number[] = [];
  const step = Math.floor(100 / count);
  for (let i = 1; i < count; i++) {
    thresholds.push(step * i);
  }
  return thresholds;
}

export function deriveThresholdsFromCompletions(
  completions: Array<{ minScoreRatio?: number | null; maxScoreRatio?: number | null }>,
): number[] {
  if (completions.length <= 1) return [];

  const thresholds: number[] = [];
  for (let i = 0; i < completions.length - 1; i++) {
    const maxRatio = completions[i]?.maxScoreRatio;
    if (maxRatio != null && maxRatio >= 0 && maxRatio < 100) {
      thresholds.push(maxRatio + 1);
    }
  }

  if (thresholds.length === completions.length - 1) {
    return thresholds;
  }

  return distributeThresholdsEvenly(completions.length);
}

export function formatScoreRange(min: number, max: number): string {
  return `${min}% ~ ${max}%`;
}

export function isMissingCompletionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.message.includes("미션 완료 데이터를 찾을 수 없습니다.")) {
    return true;
  }

  return error.cause === 404;
}
