"use client";

import { Button } from "@repo/ui/components";
import { Rocket, Save } from "lucide-react";

export interface EditorMissionActionBarProps {
  isPublished: boolean;
  isSavingAll: boolean;
  isPublishing: boolean;
  hasAnyBusySection: boolean;
  hasAnyPendingChanges: boolean;
  canSave: boolean;
  canPublish: boolean;
  onSave: () => void;
  onDraftSave: () => void;
  onPublish: () => void;
}

export function EditorMissionActionBar({
  isPublished,
  isSavingAll,
  isPublishing,
  hasAnyBusySection,
  hasAnyPendingChanges,
  canSave,
  canPublish,
  onSave,
  onDraftSave,
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
          disabled={
            isSavingAll || isPublishing || hasAnyBusySection || !hasAnyPendingChanges || !canSave
          }
        >
          저장하기
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 px-5 py-3">
      <Button
        variant="secondary"
        fullWidth
        inlineIcon
        leftIcon={<Save className="size-4" />}
        onClick={onDraftSave}
        loading={isSavingAll}
        disabled={isSavingAll || isPublishing || hasAnyBusySection || !hasAnyPendingChanges}
      >
        저장하기
      </Button>
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
