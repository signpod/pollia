import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui/components";
import { toggleBookmarkPoll } from "@/actions/poll";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import type { GetPollUserStatusResponse, ToggleBookmarkPollResponse } from "@/types/dto";

interface BookmarkMutationContext {
  previousUserStatus: GetPollUserStatusResponse | undefined;
  pollId: string;
  optimisticUpdate: boolean;
}

const BOOKMARK_MESSAGES = {
  success: {
    add: "북마크를 추가했어요.",
    remove: "북마크를 제거했어요.",
  },
  error: "북마크 처리 중 오류가 발생했어요.",
} as const;

export const useBookmark = (pollId: string) => {
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation<
    ToggleBookmarkPollResponse,
    Error,
    void,
    BookmarkMutationContext
  >({
    mutationFn: async () => {
      const result = await toggleBookmarkPoll(pollId);
      return result;
    },

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: pollQueryKeys.userPollStatus(pollId),
      });

      const previousUserStatus = queryClient.getQueryData<GetPollUserStatusResponse>(
        pollQueryKeys.userPollStatus(pollId),
      );

      queryClient.setQueryData<GetPollUserStatusResponse>(
        pollQueryKeys.userPollStatus(pollId),
        oldData => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            isBookmarked: !oldData.isBookmarked,
          };
        },
      );

      return {
        previousUserStatus,
        pollId,
        optimisticUpdate: true,
      };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pollQueryKeys.userPollStatus(pollId),
      });
      queryClient.invalidateQueries({
        queryKey: pollQueryKeys.bookmarkedPolls(),
      });
      const message = isBookmarked
        ? BOOKMARK_MESSAGES.success.add
        : BOOKMARK_MESSAGES.success.remove;
      toast.success(message);
    },

    onError: (_, _variables, context) => {
      if (context?.previousUserStatus) {
        queryClient.setQueryData<GetPollUserStatusResponse>(
          pollQueryKeys.userPollStatus(pollId),
          context.previousUserStatus,
        );
      }
      toast.error(BOOKMARK_MESSAGES.error);
    },
  });

  const userStatus = queryClient.getQueryData<GetPollUserStatusResponse>(
    pollQueryKeys.userPollStatus(pollId),
  );

  const isBookmarked = userStatus?.isBookmarked || false;

  return {
    isBookmarked,
    isProcessing: bookmarkMutation.isPending,
    handleBookmark: bookmarkMutation.mutate,
    error: bookmarkMutation.error,
    isError: bookmarkMutation.isError,
  };
};

export type UseBookmarkReturn = ReturnType<typeof useBookmark>;
