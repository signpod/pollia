export type SectionSaveStatus = "saved" | "no_changes" | "failed";

export interface SectionSaveResult {
  status: SectionSaveStatus;
  message?: string;
}

export interface SectionSaveHandle {
  save: (options?: { silent?: boolean }) => Promise<SectionSaveResult>;
  hasPendingChanges: () => boolean;
  isBusy: () => boolean;
}

export interface SectionSaveState {
  hasPendingChanges: boolean;
  isBusy: boolean;
}

export type SectionSaveStateChangeHandler = (state: SectionSaveState) => void;
