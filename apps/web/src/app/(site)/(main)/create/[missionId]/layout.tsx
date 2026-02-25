import { getMissionActionsDetail } from "@/actions/action/read";
import { requireActiveUser } from "@/actions/common/auth";
import { getCompletionsByMissionId } from "@/actions/mission-completion/list";
import { getMission } from "@/actions/mission/read";
import { ROUTES } from "@/constants/routes";
import { redirect } from "next/navigation";
import { EditorLayout } from "./components/EditorLayout";
import { EditorProvider } from "./context/EditorContext";
import { toPreviewAction, toPreviewCompletion, toPreviewMission } from "./lib/toEditorPreview";

export default async function CreateMissionEditorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  let user: Awaited<ReturnType<typeof requireActiveUser>>;
  try {
    user = await requireActiveUser();
  } catch (error) {
    const isUnauth = error instanceof Error && error.cause === 401;
    const isForbidden = error instanceof Error && error.cause === 403;
    if (isUnauth || isForbidden) {
      redirect(ROUTES.LOGIN);
    }
    throw error;
  }

  let missionRes: Awaited<ReturnType<typeof getMission>>;
  let actionsRes: Awaited<ReturnType<typeof getMissionActionsDetail>>;
  let completionsRes: Awaited<ReturnType<typeof getCompletionsByMissionId>>;
  try {
    [missionRes, actionsRes, completionsRes] = await Promise.all([
      getMission(missionId),
      getMissionActionsDetail(missionId),
      getCompletionsByMissionId(missionId),
    ]);
  } catch {
    redirect(ROUTES.CREATE);
  }

  if (!missionRes?.data) redirect(ROUTES.CREATE);
  const mission = missionRes.data;
  if (mission.creatorId !== user.id) redirect(ROUTES.CREATE);

  const actions = actionsRes?.data ?? [];
  const completions = completionsRes?.data ?? [];

  const previewMission = toPreviewMission(mission);
  const previewActions = actions
    .map(toPreviewAction)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const previewCompletions = completions.map(toPreviewCompletion);

  return (
    <EditorProvider
      missionId={missionId}
      initialMission={previewMission}
      initialActions={previewActions}
      initialCompletions={previewCompletions}
      initialIsActive={mission.isActive}
    >
      <EditorLayout>{children}</EditorLayout>
    </EditorProvider>
  );
}
