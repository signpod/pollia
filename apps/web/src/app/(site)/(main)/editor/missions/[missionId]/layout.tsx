import { getMission } from "@/actions/mission";
import { checkAuthStatus } from "@/lib/auth";
import { ModalProvider, Toaster } from "@repo/ui/components";
import { notFound, redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { EditorMissionHeader } from "./components/EditorMissionHeader";
import { EditorMissionTabProvider } from "./components/EditorMissionTabContext";
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
      <EditorMissionTabProvider>
        <div className="min-h-screen bg-zinc-50">
          <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
            <div className="px-5 pb-2 pt-4">
              <EditorMissionHeader title="프로젝트 에디터" />
              <p className="mt-2 text-sm text-zinc-500">{missionResult.data.title}</p>
            </div>
            <div className="px-2">
              <EditorMissionTabs />
            </div>
          </header>

          <main>{children}</main>
          <Toaster />
        </div>
      </EditorMissionTabProvider>
    </ModalProvider>
  );
}
