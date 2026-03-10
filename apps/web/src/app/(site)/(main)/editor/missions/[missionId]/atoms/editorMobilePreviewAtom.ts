import { atom } from "jotai";

export type MobilePreviewMode =
  | { type: "intro" }
  | { type: "action"; actionId: string }
  | { type: "completion"; completionId: string };

export const mobilePreviewModeAtom = atom<MobilePreviewMode>({ type: "intro" });

export const mobilePreviewRefreshKeyAtom = atom(0);
