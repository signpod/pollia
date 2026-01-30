import { getActionById, getMissionActionsDetail } from "@/actions/action";
import { getMyResponseForMission } from "@/actions/mission-response";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
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
): boolean {
  if (!cookieValue) return false;

  const actionIds = actions.map(a => a.id);

  if (cookieValue === "initial") {
    return actionIds[0] === actionId;
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

  // 3. nextActionId로 연결된 액션으로 되돌아가기 허용
  // targetAction이 cookieAction을 nextActionId로 가리키고 있으면 허용 (option 레벨 또는 action 레벨)
  const targetAction = actions.find(a => a.id === actionId);
  if (targetAction) {
    const hasNextActionIdToCookie =
      targetAction.options.some(opt => opt.nextActionId === cookieValue) ||
      targetAction.nextActionId === cookieValue;
    if (hasNextActionIdToCookie) return true;
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

  const [action, actionsResponse, missionResponse] = await Promise.all([
    getActionById(actionId).catch(error => {
      if (error instanceof Error && (error as Error & { cause?: number }).cause === 404) {
        notFound();
      }
      throw error;
    }),
    getMissionActionsDetail(missionId),
    getMyResponseForMission(missionId).catch(() => ({ data: null })),
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
  );

  if (!isValidNavigation) {
    redirect(ROUTES.MISSION(missionId));
  }

  queryClient.setQueryData(actionQueryKeys.actions({ missionId }), actionsResponse);
  queryClient.setQueryData(actionQueryKeys.action(actionId), action);
  queryClient.setQueryData(missionQueryKeys.missionResponseForMission(missionId), missionResponse);

  const dehydratedState = dehydrate(queryClient);

  return (
    <ActionClientTrackingWrapper>
      <ActionClientWrapper dehydratedState={dehydratedState} />
    </ActionClientTrackingWrapper>
  );
}
