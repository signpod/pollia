"use client";

import { CreateProjectInfoStep } from "@/app/(site)/(main)/create/components/CreateProjectInfoStep";
import { CreateProjectTogglesStep } from "@/app/(site)/(main)/create/components/CreateProjectTogglesStep";
import type { ReactNode } from "react";

interface EditorProjectInfoSectionProps {
  imageUploaders?: ReactNode;
  showAiCompletionToggle?: boolean;
}

export function EditorProjectInfoSection({
  imageUploaders,
  showAiCompletionToggle = false,
}: EditorProjectInfoSectionProps) {
  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <CreateProjectInfoStep hideToggles />
      {imageUploaders}
      <CreateProjectTogglesStep showAiCompletionToggle={showAiCompletionToggle} useMemberOnlyMode />
    </div>
  );
}
