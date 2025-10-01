import { dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/getQueryClient";
import {
  getPoll,
  getPollResults,
  getPollUserStatus,
  getUserVoteStatus,
} from "@/actions/poll";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import { PollClientWrapper } from "./PollClientWrapper.tsx";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys.ts";
import { getCurrentUser } from "@/actions/user/index.ts";
import { GetCurrentUserResponse } from "@/types/dto/user.ts";

interface PollPageProps {
  params: Promise<{ id: string }>;
}

export default async function PollPage({ params }: PollPageProps) {
  const queryClient = getQueryClient();
  const { id } = await params;

  // 기본 poll 정보 prefetch
  await queryClient.prefetchQuery({
    queryKey: pollQueryKeys.poll(id),
    queryFn: () => getPoll(id),
  });

  // 각 옵션별 투표 수 및 퍼센테이지 등 결과 prefetch
  await queryClient.prefetchQuery({
    queryKey: pollQueryKeys.pollResults(id),
    queryFn: () => getPollResults(id),
  });

  // 사용자 통계 정보 prefetch
  await queryClient.prefetchQuery({
    queryKey: userQueryKeys.currentUser(),
    queryFn: () => getCurrentUser(),
  });

  const currentUser = queryClient.getQueryData(
    userQueryKeys.currentUser()
  ) as GetCurrentUserResponse;

  if (currentUser?.success) {
    // 투표 참여 여부 prefetch (로그인 상태 확인 포함)
    await queryClient.prefetchQuery({
      queryKey: pollQueryKeys.userVoteStatus(id),
      queryFn: () => getUserVoteStatus(id),
    });

    // 투표 좋아요/북마크 여부 prefetch (로그인 상태 확인 포함)
    await queryClient.prefetchQuery({
      queryKey: pollQueryKeys.userPollStatus(id),
      queryFn: () => getPollUserStatus(id),
    });
  }

  const dehydratedState = dehydrate(queryClient);

  return <PollClientWrapper pollId={id} dehydratedState={dehydratedState} />;
}
