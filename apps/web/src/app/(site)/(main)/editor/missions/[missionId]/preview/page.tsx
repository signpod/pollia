import { ROUTES } from "@/constants/routes";
import { redirect } from "next/navigation";

interface EditorMissionPreviewRouteProps {
  params: Promise<{ missionId: string }>;
}

export default async function EditorMissionPreviewRoute({
  params,
}: EditorMissionPreviewRouteProps) {
  const { missionId } = await params;
  redirect(ROUTES.EDITOR_MISSION(missionId));
}
