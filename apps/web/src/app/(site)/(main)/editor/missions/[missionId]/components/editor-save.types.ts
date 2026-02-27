export type SectionSaveStatus = "saved" | "no_changes" | "invalid" | "failed";

export interface SectionSaveResult {
  status: SectionSaveStatus;
  message?: string;
}

export interface SectionSaveOptions {
  silent?: boolean;
  trigger?: "autosave" | "manual" | "publish";
  showValidationUi?: boolean;
}

export interface SectionSaveHandle {
  save: (options?: SectionSaveOptions) => Promise<SectionSaveResult>;
  hasPendingChanges: () => boolean;
  isBusy: () => boolean;
  exportDraftSnapshot: () => unknown | null;
  importDraftSnapshot: (snapshot: unknown) => Promise<void> | void;
}

export interface SectionSaveState {
  hasPendingChanges: boolean;
  isBusy: boolean;
  hasValidationIssues: boolean;
  validationIssueCount: number;
}

export type SectionSaveStateChangeHandler = (state: SectionSaveState) => void;
