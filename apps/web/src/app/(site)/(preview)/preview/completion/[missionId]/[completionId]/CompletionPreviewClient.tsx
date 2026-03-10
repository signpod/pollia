"use client";

import { ProfileHeader } from "@/components/common/ProfileHeader";
import { MissionCompletionTemplate } from "@/components/common/templates/MissionCompletionTemplate";

interface CompletionPreviewClientProps {
  imageUrl?: string | null;
  title?: string;
  description?: string;
}

export function CompletionPreviewClient({
  imageUrl,
  title,
  description,
}: CompletionPreviewClientProps) {
  return (
    <MissionCompletionTemplate
      header={<ProfileHeader showHomeIcon />}
      imageUrl={imageUrl}
      title={title}
      description={description}
    />
  );
}
