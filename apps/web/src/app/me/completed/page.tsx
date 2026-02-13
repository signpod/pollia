import { getMyResponses } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { CompletedContent } from "./CompletedContent";

export default async function CompletedPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: missionQueryKeys.myResponses(),
    queryFn: () => getMyResponses(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <CompletedContent />
      </Suspense>
    </HydrationBoundary>
  );
}
