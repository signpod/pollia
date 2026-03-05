import { getActionById, getMissionActionsDetail } from "@/actions/action";
import { MissionActionPage } from "@/components/common/pages/MissionActionPage";
import { notFound } from "next/navigation";

interface ActionPreviewPageProps {
  params: Promise<{ missionId: string; actionId: string }>;
}

export default async function ActionPreviewPage({ params }: ActionPreviewPageProps) {
  const { missionId, actionId } = await params;

  const [actionResponse, actionsResponse] = await Promise.all([
    getActionById(actionId),
    getMissionActionsDetail(missionId),
  ]);

  if (!actionResponse.data) {
    notFound();
  }

  const actions = [...actionsResponse.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const currentOrder = actions.findIndex(a => a.id === actionId);

  return (
    <MissionActionPage
      actionData={actionResponse.data}
      currentOrder={currentOrder >= 0 ? currentOrder : 0}
      totalActionCount={actions.length}
    />
  );
}
