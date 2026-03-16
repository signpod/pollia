import { requireContentManager } from "@/actions/common/auth";
import { getMission } from "@/actions/mission";
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

  let userId: string;
  let isAdmin: boolean;

  try {
    const result = await requireContentManager();
    userId = result.user.id;
    isAdmin = result.isAdmin;
  } catch {
    redirect(`/login?next=/editor/missions/${missionId}`);
  }

  const missionResult = await getMission(missionId).catch(error => {
    if (error instanceof Error && (error as Error & { cause?: number }).cause === 404) {
      notFound();
    }
    throw error;
  });

  if (!isAdmin && missionResult.data.creatorId !== userId) {
    notFound();
  }

  return <>{children}</>;
}
