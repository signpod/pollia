import { getSurveyQuestionsDetail } from "@/actions/survey";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { QuestionClientWrapper } from "./QuestionClientWrapper";

export default async function SurveyQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: surveyQueryKeys.surveyQuestions({ surveyId: id }),
    queryFn: () => getSurveyQuestionsDetail(id),
  });

  const dehydratedState = dehydrate(queryClient);

  return <QuestionClientWrapper dehydratedState={dehydratedState} />;
}
