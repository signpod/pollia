import { getMission } from "@/actions/mission";
import Providers from "@/components/providers/QueryProvider";
import { checkAuthStatus } from "@/lib/auth";
import { ModalProvider } from "@repo/ui/components";
import { notFound, redirect } from "next/navigation";
import { ManageActionsClient } from "./ManageActionsClient";

interface ManageActionsPageProps {
  params: Promise<{ missionId: string }>;
}

export default async function ManageActionsPage({ params }: ManageActionsPageProps) {
  const { missionId } = await params;

  const { isAuthenticated, user } = await checkAuthStatus().catch(() => ({
    isAuthenticated: false,
    user: null,
  }));

  if (!isAuthenticated || !user) {
    redirect(`/login?next=/mission/${missionId}/manage/actions`);
  }

  const missionResult = await getMission(missionId).catch(error => {
    if (error instanceof Error && (error as Error & { cause?: number }).cause === 404) {
      notFound();
    }
    throw error;
  });

  if (missionResult.data.creatorId !== user.id) {
    notFound();
  }

  return (
    <ModalProvider>
      <Providers>
        <ManageActionsClient missionId={missionId} />
      </Providers>
    </ModalProvider>
  );
}
