"use client";

import { CreateRewardSettingsStep } from "@/app/(site)/(main)/create/components/CreateRewardSettingsStep";
import type { ReactNode } from "react";

interface EditorRewardSectionProps {
  imageUploader?: ReactNode;
}

export function EditorRewardSection({ imageUploader }: EditorRewardSectionProps) {
  return (
    <div className="px-5 pb-5">
      <CreateRewardSettingsStep imageUploader={imageUploader} />
    </div>
  );
}
