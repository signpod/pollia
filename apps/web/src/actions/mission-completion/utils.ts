import type {
  CompletionLinkData,
  MissionCompletionData,
  MissionCompletionWithMission,
} from "@/types/dto";
import type { CompletionLink, MissionCompletion } from "@prisma/client";

type CompletionLinkWithUpload = CompletionLink & {
  fileUpload: { id: string; publicUrl: string } | null;
};

function toCompletionLinkData(link: CompletionLinkWithUpload): CompletionLinkData {
  return {
    id: link.id,
    name: link.name,
    url: link.url,
    order: link.order,
    imageUrl: link.imageUrl ?? link.fileUpload?.publicUrl ?? null,
    fileUploadId: link.fileUploadId,
  };
}

export function toMissionCompletionData<
  T extends MissionCompletion & {
    imageFileUpload: { id: string; publicUrl: string } | null;
    links: CompletionLinkWithUpload[];
  },
>(raw: T): MissionCompletionData {
  return {
    ...raw,
    links: raw.links.map(toCompletionLinkData),
  };
}

export function toMissionCompletionWithMission<
  T extends MissionCompletion & {
    imageFileUpload: { id: string; publicUrl: string } | null;
    links: CompletionLinkWithUpload[];
    mission: { id: string; creatorId: string };
  },
>(raw: T): MissionCompletionWithMission {
  return {
    ...raw,
    links: raw.links.map(toCompletionLinkData),
  };
}
