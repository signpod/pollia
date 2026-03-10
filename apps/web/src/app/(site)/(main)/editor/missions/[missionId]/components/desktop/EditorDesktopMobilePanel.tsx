"use client";

import { ROUTES } from "@/constants/routes";
import { Typo } from "@repo/ui/components";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { mobilePreviewModeAtom } from "../../atoms/editorMobilePreviewAtom";
import { MobilePreviewPanel } from "./MobilePreviewPanel";

interface EditorDesktopMobilePanelProps {
  missionId: string;
}

export function EditorDesktopMobilePanel({ missionId }: EditorDesktopMobilePanelProps) {
  const previewMode = useAtomValue(mobilePreviewModeAtom);

  const previewUrl = useMemo(() => {
    switch (previewMode.type) {
      case "action":
        return ROUTES.MISSION_ACTION_PREVIEW(missionId, previewMode.actionId);
      case "completion":
        return ROUTES.MISSION_COMPLETION_PREVIEW(missionId, previewMode.completionId);
      default:
        return ROUTES.MISSION(missionId);
    }
  }, [missionId, previewMode]);

  return (
    <section className="flex h-full min-h-[460px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-[0_10px_40px_rgba(9,9,11,0.08)]">
      <header className="px-1">
        <Typo.Body size="medium" className="font-semibold text-zinc-900">
          모바일 미리보기
        </Typo.Body>
        <Typo.Body size="small" className="mt-1 text-zinc-500">
          실제 사용자 화면 기준
        </Typo.Body>
      </header>

      <div className="mt-3 flex min-h-0 flex-1 items-start justify-center overflow-auto pb-2">
        <MobilePreviewPanel url={previewUrl} />
      </div>
    </section>
  );
}
