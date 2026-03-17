"use client";

import { MissionCompletionContent } from "@/components/common/MissionCompletionContent";
import { useParams } from "next/navigation";

interface MissionCompletionProps {
  completionId?: string;
  initialImageUrl?: string | null;
}

export function MissionCompletion({ completionId, initialImageUrl }: MissionCompletionProps) {
  const { missionId } = useParams<{ missionId: string }>();

  return (
    <MissionCompletionContent
      missionId={missionId}
      completionId={completionId}
      initialImageUrl={initialImageUrl}
    />
  );
}
