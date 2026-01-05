import { getActionById, getMissionActionsDetail } from "@/actions/action";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { ROUTES } from "@/constants/routes";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ActionClientTrackingWrapper } from "./ActionClientTrackingWrapper";
import { ActionClientWrapper } from "./ActionClientWrapper";

const ACTION_NAV_COOKIE_PREFIX = "action_nav_";

function validateActionNavigation(
  cookieValue: string | undefined,
  actionId: string,
  actionIds: string[],
): boolean {
  if (!cookieValue) return false;

  if (cookieValue === "initial") {
    return actionIds[0] === actionId;
  }

  if (cookieValue === "resume") {
    return true;
  }

  const currentIndex = actionIds.indexOf(actionId);
  const cookieIndex = actionIds.indexOf(cookieValue);

  if (currentIndex === -1 || cookieIndex === -1) return false;

  return Math.abs(currentIndex - cookieIndex) <= 1;
}

export default async function ActionPage({
  params,
}: {
  params: Promise<{ missionId: string; actionId: string }>;
}) {
  const { missionId, actionId } = await params;

  const queryClient = getQueryClient();

  const [action, actionsResponse] = await Promise.all([
    getActionById(actionId).catch(error => {
      if (error instanceof Error && (error as Error & { cause?: number }).cause === 404) {
        notFound();
      }
      throw error;
    }),
    getMissionActionsDetail(missionId),
  ]);

  const actionIds = actionsResponse.data.map(a => a.id);

  const cookieStore = await cookies();
  const navCookie = cookieStore.get(`${ACTION_NAV_COOKIE_PREFIX}${missionId}`);

  const isValidNavigation = validateActionNavigation(navCookie?.value, actionId, actionIds);

  if (!isValidNavigation) {
    redirect(ROUTES.MISSION(missionId));
  }

  queryClient.setQueryData(actionQueryKeys.actions({ missionId }), actionsResponse);
  queryClient.setQueryData(actionQueryKeys.action(actionId), action);

  const dehydratedState = dehydrate(queryClient);

  return (
    <ActionClientTrackingWrapper>
      <ActionClientWrapper dehydratedState={dehydratedState} actionIds={actionIds} />
    </ActionClientTrackingWrapper>
  );
}
