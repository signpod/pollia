"use client";

import { CreateRewardSettingsStep } from "@/app/(site)/(main)/create/components/CreateRewardSettingsStep";
import type { ReactNode } from "react";

interface EditorRewardSectionProps {
  imageUploader?: ReactNode;
  allowMultipleResponses?: boolean;
}

export function EditorRewardSection({
  imageUploader,
  allowMultipleResponses,
}: EditorRewardSectionProps) {
  return (
    <div className="px-5 pb-5">
      <CreateRewardSettingsStep
        imageUploader={imageUploader}
        allowMultipleResponses={allowMultipleResponses}
      />
    </div>
  );
}
