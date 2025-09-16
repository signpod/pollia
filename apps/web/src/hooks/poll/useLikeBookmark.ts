import { usePollMutations } from "./usePollMutations";
import { useQueryClient } from "@tanstack/react-query";
import type { Poll } from "@/types/dto/poll";

export const useLikeBookmark = (pollId: string, initialPoll: Poll) => {
  const mutations = usePollMutations(pollId);
  const queryClient = useQueryClient();

  const currentPoll =
    queryClient.getQueryData<Poll>(["poll", pollId]) || initialPoll;

  const handleLike = async () => {
    try {
      if (currentPoll.hasLiked) {
        await mutations.unlike.mutateAsync();
      } else {
        await mutations.like.mutateAsync();
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (currentPoll.hasBookmarked) {
        await mutations.unbookmark.mutateAsync();
      } else {
        await mutations.bookmark.mutateAsync();
      }
    } catch (error) {
      console.error("북마크 처리 실패:", error);
    }
  };

  const isProcessing =
    mutations.like.isPending ||
    mutations.unlike.isPending ||
    mutations.bookmark.isPending ||
    mutations.unbookmark.isPending;

  return {
    isLiked: currentPoll.hasLiked,
    isBookmarked: currentPoll.hasBookmarked,
    likeCount: currentPoll.likeCount,
    handleLike,
    handleBookmark,
    isProcessing,
  };
};

export type UseLikeBookmarkReturn = ReturnType<typeof useLikeBookmark>;
