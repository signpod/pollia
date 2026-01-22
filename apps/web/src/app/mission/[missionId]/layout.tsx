import { getMissionActionIds } from "@/actions/action";
import { getMission, getMissionParticipantInfo } from "@/actions/mission";
import { getMyResponseForMission } from "@/actions/mission-response";
import { getReward } from "@/actions/reward/read";
import { getCurrentUser } from "@/actions/user";
import Providers from "@/components/providers/QueryProvider";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { rewardQueryKeys } from "@/constants/queryKeys/rewardQueryKeys";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { SHARE_IMAGE_PATH, SHARE_MESSAGES } from "@/constants/shareMessages";
import { checkAuthStatus } from "@/lib/auth";
import { getQueryClient } from "@/lib/getQueryClient";
import { NetworkStatusProvider } from "@/components/providers/NetworkStatusProvider";
import { ModalProvider } from "@repo/ui/components";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";

interface LayoutParams {
  params: Promise<{ missionId: string }>;
}

export async function generateMetadata({ params }: LayoutParams): Promise<Metadata> {
  const { missionId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pollia.me";

  try {
    const missionResult = await getMission(missionId);
    const { title, imageUrl } = missionResult.data;

    const ogTitle = title || SHARE_MESSAGES.kakao.title;
    const ogDescription = SHARE_MESSAGES.kakao.description;
    const ogImage = imageUrl ? `${baseUrl}/api/og/${missionId}` : SHARE_IMAGE_PATH;

    return {
      title: ogTitle,
      description: ogDescription,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: ogTitle,
          },
        ],
        type: "website",
      },
    };
  } catch {
    return {
      title: SHARE_MESSAGES.kakao.title,
      description: SHARE_MESSAGES.kakao.description,
      openGraph: {
        title: SHARE_MESSAGES.kakao.title,
        description: SHARE_MESSAGES.kakao.description,
        images: [SHARE_IMAGE_PATH],
        type: "website",
      },
    };
  }
}

export default async function MissionLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ missionId: string }> }>) {
  const { missionId } = await params;
  const queryClient = getQueryClient();

  const { isAuthenticated } = await checkAuthStatus();

  const missionResult = await getMission(missionId).catch(error => {
    if (error instanceof Error && (error as Error & { cause?: number }).cause === 404) {
      notFound();
    }
    throw error;
  });

  const prefetchPromises = [
    queryClient.prefetchQuery({
      queryKey: actionQueryKeys.actionsIds({ missionId }),
      queryFn: () => getMissionActionIds(missionId),
    }),
    queryClient.prefetchQuery({
      queryKey: missionQueryKeys.missionParticipant(missionId),
      queryFn: () => getMissionParticipantInfo(missionId),
    }),
  ];

  if (isAuthenticated) {
    prefetchPromises.push(
      queryClient
        .prefetchQuery({
          queryKey: userQueryKeys.currentUser(),
          queryFn: () => getCurrentUser(),
        })
        .catch(() => {
          // 로그인하지 않은 경우 에러 무시
        }),
      queryClient
        .prefetchQuery({
          queryKey: missionQueryKeys.missionResponseForMission(missionId),
          queryFn: () => getMyResponseForMission(missionId),
        })
        .catch(() => {
          // 로그인하지 않은 경우 에러 무시
        }),
    );
  }

  await Promise.all(prefetchPromises);

  const rewardId = missionResult.data.rewardId;
  const rewardPrefetchPromises = [];
  if (rewardId) {
    rewardPrefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: rewardQueryKeys.reward(rewardId),
        queryFn: () => getReward(rewardId),
      }),
    );
  }
  if (rewardPrefetchPromises.length > 0) {
    await Promise.all(rewardPrefetchPromises);
  }

  queryClient.setQueryData(missionQueryKeys.mission(missionId), missionResult);

  const dehydratedState = dehydrate(queryClient);

  return (
    <ModalProvider>
      <NetworkStatusProvider>
        <Providers>
          <HydrationBoundary state={dehydratedState}>
            <div suppressHydrationWarning>{children}</div>
          </HydrationBoundary>
        </Providers>
      </NetworkStatusProvider>
    </ModalProvider>
  );
}
