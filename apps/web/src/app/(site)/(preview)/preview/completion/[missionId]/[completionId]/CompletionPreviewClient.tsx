"use client";

import { MissionCompletionPage } from "@/components/common/pages/MissionCompletionPage";

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
  return <MissionCompletionPage imageUrl={imageUrl} title={title} description={description} />;
}
