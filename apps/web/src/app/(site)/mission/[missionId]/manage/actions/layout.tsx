import { getMission } from "@/actions/mission";
import { checkAuthStatus } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

interface ManageActionsLayoutProps {
  params: Promise<{ missionId: string }>;
}

export default async function ManageActionsLayout({
  children,
  params,
}: PropsWithChildren<ManageActionsLayoutProps>) {
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

  return children;
}
