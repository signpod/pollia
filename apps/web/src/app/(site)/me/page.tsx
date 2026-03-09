import { getMyResponses } from "@/actions/mission-response";
import { getAllMissions } from "@/actions/mission/read";
import { getCurrentUser } from "@/actions/user";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { MissionType } from "@prisma/client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { MePageContent } from "./MePageContent";

export default async function MePage() {
  const queryClient = getQueryClient();

  const [myResponsesData, userData] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: missionQueryKeys.myResponses(),
      queryFn: () => getMyResponses(),
    }),
    queryClient.fetchQuery({
      queryKey: userQueryKeys.currentUser(),
      queryFn: () => getCurrentUser(),
    }),
    queryClient.prefetchQuery({
      queryKey: [...missionQueryKeys.allMissions(), "recommended"],
      queryFn: () => getAllMissions({ limit: 6, type: MissionType.GENERAL }),
    }),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense>
        <MePageContent user={{ name: userData.data.name, email: userData.data.email }} />
      </Suspense>
    </HydrationBoundary>
  );
}
