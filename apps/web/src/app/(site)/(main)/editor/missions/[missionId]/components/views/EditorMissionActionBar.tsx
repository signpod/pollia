"use client";

import { Button } from "@repo/ui/components";
import { AlertCircle, Redo2, Save, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";

export interface EditorMissionActionBarProps {
  isSavingAll: boolean;
  hasAnyBusySection: boolean;
  hasAnyPendingChanges: boolean;
  hasAnyValidationIssues: boolean;
  onSave: () => void;
  canUndo?: boolean;
  onUndo?: () => void;
  canRedo?: boolean;
  onRedo?: () => void;
  totalValidationIssueCount?: number;
  onScrollToFirstError?: () => void;
}

function useIsMac() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
  }, []);
  return isMac;
}

export function EditorMissionActionBar({
  isSavingAll,
  hasAnyBusySection,
  hasAnyPendingChanges,
  hasAnyValidationIssues,
  onSave,
  canUndo = false,
  onUndo,
  canRedo = false,
  onRedo,
  onScrollToFirstError,
}: EditorMissionActionBarProps) {
  const isMac = useIsMac();
  const undoKey = isMac ? "⌘Z" : "Ctrl+Z";
  const redoKey = isMac ? "⌘⇧Z" : "Ctrl+⇧Z";

  return (
    <div className="flex items-center gap-2 px-5 py-3">
      <Button
        variant="secondary"
        className="w-12 shrink-0 px-0"
        onClick={onUndo}
        disabled={!canUndo || isSavingAll || !hasAnyPendingChanges}
        title="실행 취소"
        aria-label="실행 취소"
      >
        <span className="flex flex-col items-center gap-0.5">
          <Undo2 className="size-4" />
          <span className="hidden text-[9px] leading-none opacity-50 sm:block">{undoKey}</span>
        </span>
      </Button>
      <Button
        variant="secondary"
        className="w-12 shrink-0 px-0"
        onClick={onRedo}
        disabled={!canRedo || isSavingAll}
        title="다시 실행"
        aria-label="다시 실행"
      >
        <span className="flex flex-col items-center gap-0.5">
          <Redo2 className="size-4" />
          <span className="hidden text-[9px] leading-none opacity-50 sm:block">{redoKey}</span>
        </span>
      </Button>
      {onScrollToFirstError && (
        <Button
          variant="secondary"
          className="w-12 shrink-0 px-0"
          onClick={onScrollToFirstError}
          disabled={!hasAnyValidationIssues}
          aria-label="유효성 오류로 이동"
        >
          <AlertCircle className={`size-4 ${hasAnyValidationIssues ? "text-red-500" : ""}`} />
        </Button>
      )}
      <Button
        variant="primary"
        fullWidth
        inlineIcon
        leftIcon={<Save className="size-4" />}
        onClick={onSave}
        loading={isSavingAll}
        disabled={
          isSavingAll || hasAnyBusySection || !hasAnyPendingChanges || hasAnyValidationIssues
        }
      >
        저장하기
      </Button>
    </div>
  );
}
