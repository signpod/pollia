"use client";

import { useParams } from "next/navigation";
import { EditorMissionTabs } from "../../missions/[missionId]/components/EditorMissionTabs";
import { EditorContentHeader } from "./EditorContentHeader";

export function EditorShell({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const missionId = params?.missionId as string | undefined;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
        <div className="px-5 pb-2 pt-4">
          <EditorContentHeader missionId={missionId} />
        </div>
        <div className="px-2">
          <EditorMissionTabs />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
