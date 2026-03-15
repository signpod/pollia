"use client";

import { Button } from "@repo/ui/components";
import { Save } from "lucide-react";

export interface EditorMissionActionBarProps {
  isSavingAll: boolean;
  hasAnyBusySection: boolean;
  hasAnyPendingChanges: boolean;
  hasAnyValidationIssues: boolean;
  canSave: boolean;
  onSave: () => void;
}

export function EditorMissionActionBar({
  isSavingAll,
  hasAnyBusySection,
  hasAnyPendingChanges,
  hasAnyValidationIssues,
  canSave,
  onSave,
}: EditorMissionActionBarProps) {
  return (
    <div className="flex gap-2 px-5 py-3">
      <Button
        variant="primary"
        fullWidth
        inlineIcon
        leftIcon={<Save className="size-4" />}
        onClick={onSave}
        loading={isSavingAll}
        disabled={
          isSavingAll ||
          hasAnyBusySection ||
          !hasAnyPendingChanges ||
          hasAnyValidationIssues ||
          !canSave
        }
      >
        저장하기
      </Button>
    </div>
  );
}
