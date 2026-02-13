import { getActionById, getMissionActionsDetail } from "@/actions/action";
import { getMyResponseForMission } from "@/actions/mission-response";
import { getMission } from "@/actions/mission/read";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { ROUTES } from "@/constants/routes";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ActionClientTrackingWrapper } from "./ActionClientTrackingWrapper";
import { ActionClientWrapper } from "./ActionClientWrapper";

const ACTION_NAV_COOKIE_PREFIX = "action_nav_";

interface ActionWithOptions {
  id: string;
  nextActionId?: string | null;
  options: Array<{ nextActionId?: string | null }>;
}

function validateActionNavigation(
  cookieValue: string | undefined,
  actionId: string,
  actions: ActionWithOptions[],
  entryActionId?: string | null,
): boolean {
  if (!cookieValue) return false;

  const actionIds = actions.map(a => a.id);

  if (cookieValue === "initial") {
    const validEntryId = entryActionId ?? actionIds[0];
    return validEntryId === actionId;
  }

  if (cookieValue === "resume") {
    return true;
  }

  const currentIndex = actionIds.indexOf(actionId);
  const cookieIndex = actionIds.indexOf(cookieValue);

  if (currentIndex === -1 || cookieIndex === -1) return false;

  // 1. 앞으로 점프(nextActionId) 허용
  if (currentIndex >= cookieIndex) return true;

  // 2. 인접 이동(±1, 이전/다음 버튼) 허용
  if (Math.abs(currentIndex - cookieIndex) <= 1) return true;

  // 3. cookieAction이 nextActionId로 현재 actionId를 가리키고 있으면 허용 (분기 점프)
  const cookieAction = actions.find(a => a.id === cookieValue);
  if (cookieAction) {
    const pointsToTarget =
      cookieAction.options.some(opt => opt.nextActionId === actionId) ||
      cookieAction.nextActionId === actionId;
    if (pointsToTarget) return true;
  }

  // 4. targetAction이 cookieAction을 nextActionId로 가리키고 있으면 허용 (되돌아가기)
  const targetAction = actions.find(a => a.id === actionId);
  if (targetAction) {
    const pointsToCookie =
      targetAction.options.some(opt => opt.nextActionId === cookieValue) ||
      targetAction.nextActionId === cookieValue;
    if (pointsToCookie) return true;
  }

  return false;
}

export default async function ActionPage({
  params,
}: {
  params: Promise<{ missionId: string; actionId: string }>;
}) {
  const { missionId, actionId } = await params;

  const queryClient = getQueryClient();

  const [action, actionsResponse, missionResponse, missionData] = await Promise.all([
    getActionById(actionId).catch(error => {
      if (error instanceof Error && (error as Error & { cause?: number }).cause === 404) {
        notFound();
      }
      throw error;
    }),
    getMissionActionsDetail(missionId),
    getMyResponseForMission(missionId).catch(() => ({ data: null })),
    getMission(missionId),
  ]);

  // Redirect if mission is already completed
  if (missionResponse.data?.completedAt) {
    redirect(ROUTES.MISSION(missionId));
  }

  const cookieStore = await cookies();
  const navCookie = cookieStore.get(`${ACTION_NAV_COOKIE_PREFIX}${missionId}`);

  const isValidNavigation = validateActionNavigation(
    navCookie?.value,
    actionId,
    actionsResponse.data,
    missionData.data.entryActionId,
  );

  if (!isValidNavigation) {
    redirect(ROUTES.MISSION(missionId));
  }

  queryClient.setQueryData(actionQueryKeys.actions({ missionId }), actionsResponse);
  queryClient.setQueryData(actionQueryKeys.action(actionId), action);

  const dehydratedState = dehydrate(queryClient);

  return (
    <ActionClientTrackingWrapper>
      <ActionClientWrapper dehydratedState={dehydratedState} />
    </ActionClientTrackingWrapper>
  );
}
