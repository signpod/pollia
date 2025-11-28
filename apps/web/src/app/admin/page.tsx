import { getUserSurveys } from "@/actions/survey/read";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { AdminDashboardClient } from "./components/AdminDashboardClient";

export default async function AdminPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: surveyQueryKeys.userSurveys(),
    queryFn: ({ pageParam }) => {
      return getUserSurveys({
        cursor: pageParam,
        limit: 10,
      });
    },
    initialPageParam: "",
  });

  const dehydratedState = dehydrate(queryClient);

  return <AdminDashboardClient dehydratedState={dehydratedState} />;
}
