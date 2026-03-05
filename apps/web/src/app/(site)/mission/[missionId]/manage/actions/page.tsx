import { ManageActionsClient } from "./ManageActionsClient";

interface ManageActionsPageProps {
  params: Promise<{ missionId: string }>;
}

export default async function ManageActionsPage({ params }: ManageActionsPageProps) {
  const { missionId } = await params;
  return <ManageActionsClient missionId={missionId} />;
}
