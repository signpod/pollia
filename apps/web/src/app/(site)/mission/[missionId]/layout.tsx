import { getMissionActionIds } from "@/actions/action";
import { getMissionParticipantInfo } from "@/actions/mission";
import { getMyResponseForMission } from "@/actions/mission-response";
import { claimGuestResponses } from "@/actions/mission-response/claimGuestResponses";
import { getReward } from "@/actions/reward/read";
import { getCurrentUser } from "@/actions/user";
import { NetworkStatusProvider } from "@/components/providers/NetworkStatusProvider";
import Providers from "@/components/providers/QueryProvider";
import { GUEST_ID_COOKIE_NAME } from "@/constants/cookie";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { rewardQueryKeys } from "@/constants/queryKeys/rewardQueryKeys";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { SHARE_IMAGE_PATH, SHARE_MESSAGES } from "@/constants/shareMessages";
import { checkAuthStatus } from "@/lib/auth";
import { getQueryClient } from "@/lib/getQueryClient";
import { ModalProvider } from "@repo/ui/components";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";
import { getCachedMission } from "./getCachedMission";

interface LayoutParams {
  params: Promise<{ missionId: string }>;
}

export async function generateMetadata({ params }: LayoutParams): Promise<Metadata> {
  const { missionId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pollia.me";

  try {
    const missionResult = await getCachedMission(missionId);
    const { title, description, imageUrl } = missionResult.data;

    const ogTitle = title || SHARE_MESSAGES.kakao.title;
    let ogDescription = description || SHARE_MESSAGES.kakao.description;
    ogDescription = ogDescription
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (ogDescription.length > 70) {
      ogDescription = `${ogDescription.slice(0, 70)}...`;
    }
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

  const handleNotFound = (error: unknown) => {
    if (error instanceof Error && (error as Error & { cause?: number }).cause === 404) {
      notFound();
    }
    throw error;
  };

  const [{ isAuthenticated }, missionResult] = await Promise.all([
    checkAuthStatus().catch(handleNotFound),
    getCachedMission(missionId).catch(handleNotFound),
  ]);

  if ("error" in missionResult && missionResult.error?.cause === 404) {
    notFound();
  }

  const prefetchPromises: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: actionQueryKeys.actionsIds({ missionId }),
      queryFn: () => getMissionActionIds(missionId),
    }),
    queryClient.prefetchQuery({
      queryKey: missionQueryKeys.missionParticipant(missionId),
      queryFn: () => getMissionParticipantInfo(missionId),
    }),
  ];

  const rewardId = missionResult.data.rewardId;
  if (rewardId) {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: rewardQueryKeys.reward(rewardId),
        queryFn: () => getReward(rewardId),
      }),
    );
  }

  if (isAuthenticated) {
    const cookieStore = await cookies();
    const hasGuestCookie = !!cookieStore.get(GUEST_ID_COOKIE_NAME)?.value;

    const [currentUserResult] = await Promise.all([
      queryClient
        .fetchQuery({
          queryKey: userQueryKeys.currentUser(),
          queryFn: () => getCurrentUser(),
        })
        .catch(() => null),
      hasGuestCookie ? claimGuestResponses().catch(() => {}) : Promise.resolve(),
    ]);

    const actorKey = currentUserResult?.data?.id ?? "guest";

    prefetchPromises.push(
      queryClient
        .prefetchQuery({
          queryKey: [...missionQueryKeys.missionResponseForMission(missionId), actorKey],
          queryFn: () => getMyResponseForMission(missionId),
        })
        .catch(() => {}),
    );
  }

  await Promise.all(prefetchPromises);

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
