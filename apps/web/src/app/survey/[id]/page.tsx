import { getSurvey } from "@/actions/survey";
import { getCurrentUser } from "@/actions/user";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getAuthError } from "@/lib/getAuthError";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { SurveyClientWrapper } from "./SurveyClientWrapper";

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authError = await getAuthError();

  const { id } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: surveyQueryKeys.survey(id),
    queryFn: () => getSurvey(id),
  });

  await queryClient.prefetchQuery({
    queryKey: userQueryKeys.currentUser(),
    queryFn: () => getCurrentUser(),
  });

  const dehydratedState = dehydrate(queryClient);

  return <SurveyClientWrapper dehydratedState={dehydratedState} initialError={authError} />;
}
