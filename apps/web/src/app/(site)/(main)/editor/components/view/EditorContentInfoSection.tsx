"use client";

import { CreateContentInfoStep } from "@/app/(site)/(main)/create/components/CreateContentInfoStep";
import { CreateContentTogglesStep } from "@/app/(site)/(main)/create/components/CreateContentTogglesStep";
import type { ReactNode } from "react";

interface EditorContentInfoSectionProps {
  imageUploaders?: ReactNode;
  showAiCompletionToggle?: boolean;
  hasReward?: boolean;
}

export function EditorContentInfoSection({
  imageUploaders,
  showAiCompletionToggle = false,
  hasReward,
}: EditorContentInfoSectionProps) {
  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <CreateContentInfoStep hideToggles />
      {imageUploaders}
      <CreateContentTogglesStep
        showAiCompletionToggle={showAiCompletionToggle}
        useMemberOnlyMode
        hasReward={hasReward}
      />
    </div>
  );
}
