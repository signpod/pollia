import { ManageActionEditClient } from "./ManageActionEditClient";

interface ManageActionEditPageProps {
  params: Promise<{ missionId: string; actionId: string }>;
}

export default async function ManageActionEditPage({ params }: ManageActionEditPageProps) {
  const { missionId, actionId } = await params;
  return <ManageActionEditClient missionId={missionId} actionId={actionId} />;
}
