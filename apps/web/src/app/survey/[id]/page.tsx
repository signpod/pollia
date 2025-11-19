import { getSurvey } from "@/actions/survey";
import { getCurrentUser } from "@/actions/user";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getAuthError } from "@/lib/getAuthError";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { SurveyClientWrapper } from "./SurveyClientWrapper";

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, authError] = await Promise.all([params, getAuthError()]);

  const queryClient = getQueryClient();

  const [surveyResult] = await Promise.all([
    getSurvey(id).catch(error => {
      if (error instanceof Error && (error as Error & { cause?: number }).cause === 404) {
        notFound();
      }
      throw error;
    }),
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.currentUser(),
      queryFn: () => getCurrentUser(),
    }),
  ]);

  queryClient.setQueryData(surveyQueryKeys.survey(id), surveyResult);

  const dehydratedState = dehydrate(queryClient);

  return <SurveyClientWrapper dehydratedState={dehydratedState} initialError={authError} />;
}
