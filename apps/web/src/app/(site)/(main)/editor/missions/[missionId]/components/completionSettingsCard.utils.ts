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
  };
}

function normalizeValues(values: CompletionFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    imageUrl: values.imageUrl ?? null,
    imageFileUploadId: values.imageFileUploadId ?? null,
    links: values.links ?? [],
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
    JSON.stringify(left.links) === JSON.stringify(right.links)
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

export function isMissingCompletionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.message.includes("미션 완료 데이터를 찾을 수 없습니다.")) {
    return true;
  }

  return error.cause === 404;
}
