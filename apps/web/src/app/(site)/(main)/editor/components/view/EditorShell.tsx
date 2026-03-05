"use client";

import { useReadMission } from "@/hooks/mission";
import { useParams } from "next/navigation";
import { EditorMissionHeader } from "../../missions/[missionId]/components/EditorMissionHeader";
import { EditorMissionTabs } from "../../missions/[missionId]/components/EditorMissionTabs";
import { EditorCreateHeader } from "./EditorCreateHeader";

function EditorMissionHeaderWithTitle({ missionId }: { missionId: string }) {
  const missionQuery = useReadMission(missionId);
  const title = missionQuery.data?.data?.title;

  return (
    <>
      <EditorMissionHeader title="프로젝트 에디터" missionId={missionId} />
      {title ? <p className="mt-2 text-sm text-zinc-500">{title}</p> : null}
    </>
  );
}

export function EditorShell({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const missionId = params?.missionId as string | undefined;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
        <div className="px-5 pb-2 pt-4">
          {missionId ? (
            <EditorMissionHeaderWithTitle missionId={missionId} />
          ) : (
            <EditorCreateHeader />
          )}
        </div>
        <div className="px-2">
          <EditorMissionTabs />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
