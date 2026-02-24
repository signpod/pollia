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
