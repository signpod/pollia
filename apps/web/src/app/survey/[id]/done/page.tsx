import { getSurveyQuestionsDetail } from "@/actions/survey";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { Before } from "./ui";

export default async function SurveyPage({
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

  return <Before />;
}
