"use client";

import { updateMission } from "@/actions/mission/update";
import { ROUTES } from "@/constants/routes";
import { ButtonV2, Typo } from "@repo/ui/components";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useEditor } from "../context/EditorContext";
import { UnsavedChangesModal } from "./UnsavedChangesModal";

export function EditorHeader() {
  const { missionId, hasUnsavedChanges, pendingIsActive, setHasUnsavedChanges } = useEditor();
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      await updateMission(missionId, { isActive: pendingIsActive });
      setHasUnsavedChanges(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  }, [missionId, pendingIsActive, setHasUnsavedChanges]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const handleBackClick = (e: React.MouseEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      setShowUnsavedModal(true);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 py-3">
      <UnsavedChangesModal
        open={showUnsavedModal}
        onOpenChange={setShowUnsavedModal}
        missionId={missionId}
        pendingIsActive={pendingIsActive}
        onSaved={() => setHasUnsavedChanges(false)}
      />
      <div className="flex items-center gap-2">
        <ButtonV2
          variant="tertiary"
          size="medium"
          asChild
          className="h-9 w-9 shrink-0 p-0"
          aria-label="목록으로"
        >
          <Link href={ROUTES.CREATE} onClick={handleBackClick}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </ButtonV2>
        <Typo.Body size="large" className="font-semibold text-zinc-900">
          미션 편집
        </Typo.Body>
        {hasUnsavedChanges && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            미저장
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Typo.Body size="small" className="text-zinc-500">
          {pendingIsActive ? "공개" : "비공개"}
        </Typo.Body>
        <ButtonV2
          variant="secondary"
          size="medium"
          onClick={handleSave}
          disabled={saveStatus === "saving"}
        >
          {saveStatus === "saving" ? "저장 중..." : saveStatus === "saved" ? "저장됨" : "저장"}
        </ButtonV2>
        <ButtonV2 variant="primary" size="medium" asChild>
          <Link href={ROUTES.MISSION(missionId)} target="_blank" rel="noopener noreferrer">
            미리보기
          </Link>
        </ButtonV2>
      </div>
    </header>
  );
}
