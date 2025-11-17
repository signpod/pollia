import { getSurvey, getSurveyQuestionsDetail } from "@/actions/survey";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { SurveyClientWrapper } from "./SurveyClientWrapper";

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: surveyQueryKeys.survey(id),
    queryFn: () => getSurvey(id),
  });

  await queryClient.prefetchQuery({
    queryKey: surveyQueryKeys.surveyQuestions({ surveyId: id }),
    queryFn: () => getSurveyQuestionsDetail(id),
  });

  const dehydratedState = dehydrate(queryClient);

  return <SurveyClientWrapper dehydratedState={dehydratedState} />;
}
