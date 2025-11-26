import { getUserSurveys } from "@/actions/survey";
import { getSurveyQuestions } from "@/actions/survey-question";
import { getCurrentUser } from "@/actions/user/read";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
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
    queryKey: surveyQueryKeys.surveyQuestions(),
    queryFn: () => {
      return getSurveyQuestions();
    },
  });

  await queryClient.prefetchInfiniteQuery({
    queryKey: surveyQueryKeys.userSurveys(),
    queryFn: ({ pageParam }) => {
      return getUserSurveys({
        cursor: pageParam,
        limit: 10,
      });
    },
    initialPageParam: undefined as string | undefined,
  });

  const dehydratedState = dehydrate(queryClient);

  return <MeClientWrapper dehydratedState={dehydratedState} />;
}
