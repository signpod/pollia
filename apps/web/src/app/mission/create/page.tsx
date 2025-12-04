"use server";

import { getSurveyQuestions } from "@/actions/action";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { CreateMissionContent } from "./ui/CreateMissionContent";
import { PageClientWrapper } from "./ui/PageClientWrapper";

export default async function CreateMissionPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: actionQueryKeys.actions(),
    queryFn: () => getSurveyQuestions(),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <PageClientWrapper dehydratedState={dehydratedState}>
      <CreateMissionContent />
    </PageClientWrapper>
  );
}
