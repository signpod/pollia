import { ManageActionCreateClient } from "./ManageActionCreateClient";

interface ManageActionCreatePageProps {
  params: Promise<{ missionId: string }>;
}

export default async function ManageActionCreatePage({ params }: ManageActionCreatePageProps) {
  const { missionId } = await params;
  return <ManageActionCreateClient missionId={missionId} />;
}
