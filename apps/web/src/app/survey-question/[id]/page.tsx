import { getSurveyQuestionsDetail } from "@/actions/survey";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { QuestionClientWrapper } from "./QuestionClientWrapper";

export default async function SurveyQuestionPage({
  searchParams,
}: {
  searchParams: Promise<{ surveyId?: string }>;
}) {
  const { surveyId } = await searchParams;
  const queryClient = getQueryClient();

  if (!surveyId) {
    throw new Error("surveyId가 필요합니다.");
  }

  await queryClient.prefetchQuery({
    queryKey: surveyQueryKeys.surveyQuestions({ surveyId }),
    queryFn: () => getSurveyQuestionsDetail(surveyId),
  });

  const dehydratedState = dehydrate(queryClient);

  return <QuestionClientWrapper dehydratedState={dehydratedState} />;
}
