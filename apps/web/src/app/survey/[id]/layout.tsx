import { getSurveyQuestionIds } from "@/actions/action";
import { getSurvey } from "@/actions/mission";
import { getMyResponseForSurvey } from "@/actions/mission-response";
import { getCurrentUser } from "@/actions/user";
import Providers from "@/components/providers/QueryProvider";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { ModalProvider } from "@repo/ui/components";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function SurveyLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const queryClient = getQueryClient();

  // Survey 데이터와 User 데이터를 prefetch
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
    queryClient.prefetchQuery({
      queryKey: surveyQueryKeys.surveyQuestionIds({ surveyId: id }),
      queryFn: () => getSurveyQuestionIds(id),
    }),
    queryClient.prefetchQuery({
      queryKey: surveyQueryKeys.surveyResponseForSurvey(id),
      queryFn: () => getMyResponseForSurvey(id),
    }),
  ]);

  queryClient.setQueryData(surveyQueryKeys.survey(id), surveyResult);

  const dehydratedState = dehydrate(queryClient);

  return (
    <ModalProvider>
      <Providers>
        <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      </Providers>
    </ModalProvider>
  );
}
