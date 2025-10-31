import { dehydrate } from "@tanstack/react-query";
import { getUserPolls } from "@/actions/poll";
import { getBookmarkedPolls, getLikedPolls } from "@/actions/poll/read";
import { getCurrentUser } from "@/actions/user/read";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { MeClientWrapper } from "./MeClientWrapper";

export default async function MePage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: userQueryKeys.currentUser(),
    queryFn: () => getCurrentUser(),
  });

  await queryClient.prefetchQuery({
    queryKey: pollQueryKeys.userPolls(),
    queryFn: () => getUserPolls(),
  });

  await queryClient.prefetchQuery({
    queryKey: pollQueryKeys.bookmarkedPolls(),
    queryFn: () => getBookmarkedPolls(),
  });

  await queryClient.prefetchQuery({
    queryKey: pollQueryKeys.likedPolls(),
    queryFn: () => getLikedPolls(),
  });

  const dehydratedState = dehydrate(queryClient);

  return <MeClientWrapper dehydratedState={dehydratedState} />;
}
