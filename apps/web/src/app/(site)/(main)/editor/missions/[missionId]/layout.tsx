import { getMission } from "@/actions/mission";
import { checkAuthStatus } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

interface EditorMissionLayoutProps {
  params: Promise<{ missionId: string }>;
}

export default async function EditorMissionLayout({
  children,
  params,
}: PropsWithChildren<EditorMissionLayoutProps>) {
  const { missionId } = await params;

  const { isAuthenticated, user } = await checkAuthStatus().catch(() => ({
    isAuthenticated: false,
    user: null,
  }));

  if (!isAuthenticated || !user) {
    redirect(`/login?next=/editor/missions/${missionId}`);
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

  return <>{children}</>;
}
