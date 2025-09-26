import { dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/getQueryClient";
import { getPoll, getPollResults, getUserVoteStatus } from "@/actions/poll";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import PollClientWrapper from "./PollClientWrapper.tsx";

interface PollPageProps {
  params: { id: string };
}

export default async function PollPage({ params }: PollPageProps) {
  const queryClient = getQueryClient();

  // 기본 poll 정보 prefetch
  await queryClient.prefetchQuery({
    queryKey: pollQueryKeys.poll(params.id),
    queryFn: () => getPoll(params.id),
  });

  // 각 옵션별 투표 수 및 퍼센테이지 등 결과 prefetch
  await queryClient.prefetchQuery({
    queryKey: pollQueryKeys.pollResults(params.id),
    queryFn: () => getPollResults(params.id),
  });

  // 투표 참여 여부 prefetch (로그인 상태 확인 포함)
  await queryClient.prefetchQuery({
    queryKey: pollQueryKeys.userVoteStatus(params.id),
    queryFn: () => getUserVoteStatus(params.id),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <PollClientWrapper pollId={params.id} dehydratedState={dehydratedState} />
  );
}
