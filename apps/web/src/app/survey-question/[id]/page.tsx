import { getQuestionById } from "@/actions/survey";
import { getSurveyQuestionsDetail } from "@/actions/survey-question";
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

  const question = await getQuestionById(id);
  const surveyId = question.data.surveyId;

  if (surveyId) {
    await queryClient.prefetchQuery({
      queryKey: surveyQueryKeys.surveyQuestions({ surveyId }),
      queryFn: () => getSurveyQuestionsDetail(surveyId),
    });
  }

  queryClient.setQueryData(surveyQueryKeys.surveyQuestion(id), question);

  const dehydratedState = dehydrate(queryClient);

  return (
    <QuestionClientWrapper
      surveyId={surveyId ?? ""}
      dehydratedState={dehydratedState}
      currentQuestionId={id}
    />
  );
}
