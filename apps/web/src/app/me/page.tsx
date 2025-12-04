import { getUserMissions } from "@/actions/mission";
import { getCurrentUser } from "@/actions/user/read";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { MeClientWrapper } from "./MeClientWrapper";

export default async function MePage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: userQueryKeys.currentUser(),
    queryFn: () => getCurrentUser(),
  });

  await queryClient.prefetchQuery({
    queryKey: actionQueryKeys.actions(),
    queryFn: () => {
      return getUserMissions();
    },
  });

  await queryClient.prefetchInfiniteQuery({
    queryKey: missionQueryKeys.userMissions(),
    queryFn: ({ pageParam }) => {
      return getUserMissions({
        cursor: pageParam,
        limit: 10,
      });
    },
    initialPageParam: undefined as string | undefined,
  });

  const dehydratedState = dehydrate(queryClient);

  return <MeClientWrapper dehydratedState={dehydratedState} />;
}
