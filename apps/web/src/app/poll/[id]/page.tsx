import { dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/getQueryClient";
import { getPoll } from "@/actions/poll";
import PollClientWrapper from "./PollClientWrapper.tsx";

interface PollPageProps {
  params: { id: string };
}

export default async function PollPage({ params }: PollPageProps) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["poll", params.id],
    queryFn: () => getPoll(params.id),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <PollClientWrapper pollId={params.id} dehydratedState={dehydratedState} />
  );
}
