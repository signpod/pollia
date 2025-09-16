interface CreatePollStep {
  id: "type" | "binaryInfo" | "multipleInfo" | "category";
  title: string;
  description?: string;
  canGoNext: boolean;
  canGoBack: boolean;
  level: number; // 계층 레벨 (0: type, 1: info, 2: category)
}

export type { CreatePollStep };
