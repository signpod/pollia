export interface StartResponseInput {
  missionId: string;
}

export interface ResponseActor {
  userId?: string | null;
  guestId?: string | null;
}

export interface CompleteResponseInput {
  responseId: string;
}

export interface ResponseRequestMeta {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface CleanupAbuseMetaResult {
  clearedCount: number;
  cutoffDate: Date;
}

export interface ResponseStats {
  total: number;
  completed: number;
  completionRate: number;
}

export interface GetMissionResponsesPageOptions {
  page: number;
  pageSize: number;
  membersOnly?: boolean;
}

export interface MissionResponsesPageResult<TResponse> {
  responses: TResponse[];
  pagination: {
    page: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
  };
}

export type NormalizedActor = {
  userId: string | null;
  guestId: string | null;
};

export function normalizeActor(actor: string | ResponseActor): NormalizedActor {
  if (typeof actor === "string") {
    return { userId: actor, guestId: null };
  }

  return {
    userId: actor.userId ?? null,
    guestId: actor.guestId ?? null,
  };
}

export function isResponseOwner(
  response: { userId?: string | null; guestId?: string | null },
  actor: NormalizedActor,
): boolean {
  if (actor.userId) {
    return response.userId === actor.userId;
  }

  if (actor.guestId) {
    return (response.guestId ?? null) === actor.guestId;
  }

  return false;
}
