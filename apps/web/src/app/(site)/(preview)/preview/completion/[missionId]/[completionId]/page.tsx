import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { notFound } from "next/navigation";
import { CompletionPreviewClient } from "./CompletionPreviewClient";

interface CompletionPreviewPageProps {
  params: Promise<{ missionId: string; completionId: string }>;
}

export default async function CompletionPreviewPage({ params }: CompletionPreviewPageProps) {
  const { missionId, completionId } = await params;

  const response = await getCompletionsByMissionId(missionId);
  const completion = response.data.find(c => c.id === completionId);

  if (!completion) {
    notFound();
  }

  return (
    <CompletionPreviewClient
      imageUrl={completion.imageUrl}
      title={completion.title}
      description={completion.description ?? undefined}
      links={completion.links ?? undefined}
    />
  );
}
