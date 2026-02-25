import type { ActionDetail } from "@/types/dto/action/responses";
import type { Mission } from "@prisma/client";
import type { PreviewAction, PreviewCompletion, PreviewMission } from "../context/EditorContext";

type ActionLike = {
  id: string;
  title: string;
  description?: string | null;
  type: import("@prisma/client").ActionType;
  order?: number | null;
  isRequired?: boolean;
  nextActionId?: string | null;
  nextCompletionId?: string | null;
};

type CompletionWithLinks = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  links: unknown;
};

export function toPreviewMission(mission: Mission): PreviewMission {
  return {
    id: mission.id,
    title: mission.title,
    description: mission.description,
    imageUrl: mission.imageUrl,
    category: mission.category,
    isActive: mission.isActive,
    entryActionId: mission.entryActionId,
  };
}

export function toPreviewAction(action: ActionDetail): PreviewAction {
  return {
    id: action.id,
    title: action.title,
    description: action.description,
    type: action.type,
    order: action.order ?? 0,
    isRequired: action.isRequired,
    nextActionId: action.nextActionId,
    nextCompletionId: action.nextCompletionId,
    options: (action.options ?? []).map(opt => ({
      id: opt.id,
      title: opt.title,
      order: opt.order,
      nextActionId: opt.nextActionId,
      nextCompletionId: opt.nextCompletionId,
    })),
  };
}

export function toPreviewActionFromAction(action: ActionLike): PreviewAction {
  return {
    id: action.id,
    title: action.title,
    description: action.description ?? null,
    type: action.type,
    order: action.order ?? 0,
    isRequired: action.isRequired ?? true,
    nextActionId: action.nextActionId ?? null,
    nextCompletionId: action.nextCompletionId ?? null,
    options: [],
  };
}

function linksRecordToArray(links: Record<string, string> | null): PreviewCompletion["links"] {
  if (!links || typeof links !== "object") return [];
  return Object.entries(links).map(([id, url]) => ({
    id,
    url,
    ogTitle: null,
    ogImage: null,
  }));
}

export function toPreviewCompletion(c: CompletionWithLinks): PreviewCompletion {
  const links =
    c.links && typeof c.links === "object" && !Array.isArray(c.links)
      ? linksRecordToArray(c.links as Record<string, string>)
      : Array.isArray(c.links)
        ? (c.links as PreviewCompletion["links"])
        : [];
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    imageUrl: c.imageUrl,
    links,
  };
}
