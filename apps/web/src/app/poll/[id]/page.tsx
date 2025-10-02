import { cache } from "react";
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
import type { Metadata } from "next";

interface PollPageProps {
  params: Promise<{ id: string }>;
}

// 서버 컴포넌트 전용 캐시 (generateMetadata와 PollPage 간 중복 방지)
const getCachedPoll = cache(getPoll);

export async function generateMetadata({
  params,
}: PollPageProps): Promise<Metadata> {
  const { id } = await params;
  const pollData = await getCachedPoll(id);

  if (!pollData.success || !pollData.data) {
    return {
      title: "투표를 찾을 수 없습니다",
      description: "요청하신 투표를 찾을 수 없습니다.",
    };
  }

  const poll = pollData.data;
  const title = poll.title;
  const description = poll.description
    ? `${poll.description.slice(0, 150)}${poll.description.length > 150 ? "..." : ""}`
    : `${poll.title}에 대한 투표에 참여해보세요!`;

  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://pollia.co.kr"}/poll/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "폴리아",
      type: "website",
      ...(poll.imageUrl && {
        images: [
          {
            url: poll.imageUrl,
            width: 1200,
            height: 630,
            alt: poll.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(poll.imageUrl && {
        images: [poll.imageUrl],
      }),
    },
  };
}

export default async function PollPage({ params }: PollPageProps) {
  const queryClient = getQueryClient();
  const { id } = await params;

  // 기본 poll 정보 prefetch
  await queryClient.prefetchQuery({
    queryKey: pollQueryKeys.poll(id),
    queryFn: () => getCachedPoll(id),
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
