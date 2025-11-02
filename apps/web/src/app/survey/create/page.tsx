"use server";

import { getSurveyQuestions } from "@/actions/survey";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { CreateSurveyContent } from "./ui/CreateSurveyContent";
import { PageClientWrapper } from "./ui/PageClientWrapper";

export default async function CreateSurveyPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: surveyQueryKeys.surveyQuestions(),
    queryFn: () => getSurveyQuestions(),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <PageClientWrapper dehydratedState={dehydratedState}>
      <CreateSurveyContent />
    </PageClientWrapper>
  );
}
