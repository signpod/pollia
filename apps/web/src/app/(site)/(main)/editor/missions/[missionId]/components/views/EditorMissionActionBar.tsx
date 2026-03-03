"use client";

import { Button } from "@repo/ui/components";
import { Rocket, Save } from "lucide-react";

export interface EditorMissionActionBarProps {
  isPublished: boolean;
  isSavingAll: boolean;
  isPublishing: boolean;
  hasAnyBusySection: boolean;
  hasAnyPendingChanges: boolean;
  canPublish: boolean;
  onSave: () => void;
  onPublish: () => void;
}

export function EditorMissionActionBar({
  isPublished,
  isSavingAll,
  isPublishing,
  hasAnyBusySection,
  hasAnyPendingChanges,
  canPublish,
  onSave,
  onPublish,
}: EditorMissionActionBarProps) {
  if (isPublished) {
    return (
      <div className="px-5 py-3">
        <Button
          variant="primary"
          fullWidth
          inlineIcon
          leftIcon={<Save className="size-4" />}
          onClick={onSave}
          loading={isSavingAll}
          disabled={isSavingAll || isPublishing || hasAnyBusySection || !hasAnyPendingChanges}
        >
          저장하기
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 py-3">
      <Button
        variant="primary"
        fullWidth
        inlineIcon
        leftIcon={<Rocket className="size-4" />}
        onClick={onPublish}
        loading={isPublishing}
        disabled={isSavingAll || isPublishing || hasAnyBusySection || !canPublish}
      >
        발행하기
      </Button>
    </div>
  );
}
