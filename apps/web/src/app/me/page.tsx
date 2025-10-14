import { getQueryClient } from "@/lib/getQueryClient";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import { dehydrate } from "@tanstack/react-query";
import { getUserPolls } from "@/actions/poll";
import { MeClientWrapper } from "./MeClientWrapper";
import { getBookmarkedPolls, getLikedPolls } from "@/actions/poll/read";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getCurrentUser } from "@/actions/user/read";

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
