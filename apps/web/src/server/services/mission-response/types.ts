export interface StartResponseInput {
  missionId: string;
}

export interface CompleteResponseInput {
  responseId: string;
}

export interface ResponseStats {
  total: number;
  completed: number;
  completionRate: number;
}
