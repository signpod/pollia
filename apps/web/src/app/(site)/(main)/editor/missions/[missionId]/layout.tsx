import { getMission } from "@/actions/mission";
import { checkAuthStatus } from "@/lib/auth";
import { ModalProvider, Toaster } from "@repo/ui/components";
import { notFound, redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { EditorMissionTabs } from "./components/EditorMissionTabs";

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

  return (
    <ModalProvider>
      <div className="min-h-screen bg-zinc-50">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
          <div className="px-2">
            <EditorMissionTabs missionId={missionId} />
          </div>
        </header>

        <main>{children}</main>
        <Toaster />
      </div>
    </ModalProvider>
  );
}
