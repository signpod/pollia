"use client";

import { EditorHeader } from "./EditorHeader";
import { FloatingFlowPanel } from "./FloatingFlowPanel";
import { FloatingMobilePreview } from "./FloatingMobilePreview";

const SHOW_MOBILE_PREVIEW = false;

export function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <EditorHeader />
      <main
        className={
          SHOW_MOBILE_PREVIEW
            ? "mx-auto max-w-2xl overflow-visible px-5 pb-24 pt-6 xl:pr-[340px]"
            : "mx-auto max-w-2xl overflow-visible px-5 pb-24 pt-6"
        }
      >
        {children}
      </main>
      {SHOW_MOBILE_PREVIEW && <FloatingMobilePreview />}
      <FloatingFlowPanel />
    </div>
  );
}
