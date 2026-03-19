"use client";

import { Button } from "@repo/ui/components";
import { AlertCircle, Save, Undo2 } from "lucide-react";

export interface EditorMissionActionBarProps {
  isSavingAll: boolean;
  hasAnyBusySection: boolean;
  hasAnyPendingChanges: boolean;
  hasAnyValidationIssues: boolean;
  onSave: () => void;
  canUndo?: boolean;
  onUndo?: () => void;
  totalValidationIssueCount?: number;
  onScrollToFirstError?: () => void;
}

export function EditorMissionActionBar({
  isSavingAll,
  hasAnyBusySection,
  hasAnyPendingChanges,
  hasAnyValidationIssues,
  onSave,
  canUndo = false,
  onUndo,
  onScrollToFirstError,
}: EditorMissionActionBarProps) {
  return (
    <div className="flex items-center gap-2 px-5 py-3">
      <Button
        variant="secondary"
        className="w-12 shrink-0 px-0"
        onClick={onUndo}
        disabled={!canUndo || isSavingAll}
        aria-label="실행 취소"
      >
        <Undo2 className="size-4" />
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
