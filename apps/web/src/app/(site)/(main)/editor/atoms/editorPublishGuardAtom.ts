import { atom } from "jotai";

export interface PublishGuardResult {
  allowed: boolean;
  message?: string;
}

export type PublishGuardFn = () => PublishGuardResult;

export const editorPublishGuardAtom = atom<PublishGuardFn | null>(null);
