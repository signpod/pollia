import { ROUTES } from "@/constants/routes";
import { redirect } from "next/navigation";

interface EditorMissionStatsRouteProps {
  params: Promise<{ missionId: string }>;
}

export default async function EditorMissionStatsRoute({ params }: EditorMissionStatsRouteProps) {
  const { missionId } = await params;
  redirect(ROUTES.EDITOR_MISSION(missionId));
}
