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

export interface ResponseStats {
  total: number;
  completed: number;
  completionRate: number;
}
