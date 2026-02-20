import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { MissionCompletionPage } from "@/components/common/pages/MissionCompletionPage";
import { notFound } from "next/navigation";

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
    <MissionCompletionPage
      imageUrl={completion.imageUrl}
      title={completion.title}
      description={completion.description ?? undefined}
      links={completion.links ?? undefined}
    />
  );
}
