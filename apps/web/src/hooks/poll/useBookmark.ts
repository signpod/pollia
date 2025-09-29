import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleBookmarkPoll } from "@/actions/poll";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import type { GetPollResponse } from "@/types/dto";

interface BookmarkResponse {
  success: boolean;
  data?: {
    isBookmarked: boolean;
    message: string;
  };
  error?: string;
}

interface BookmarkMutationContext {
  previousPoll: GetPollResponse | undefined;
  pollId: string;
  optimisticUpdate: boolean;
}

export const useBookmark = (pollId: string) => {
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation<
    BookmarkResponse,
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
        queryKey: pollQueryKeys.poll(pollId),
      });

      const previousPoll = queryClient.getQueryData<GetPollResponse>(
        pollQueryKeys.poll(pollId)
      );

      queryClient.setQueryData<GetPollResponse>(
        pollQueryKeys.poll(pollId),
        (oldData) => {
          if (!oldData?.success || !oldData.data) return oldData;

          const currentBookmarkCount = oldData.data._count?.bookmarks || 0;
          const hasUserBookmarked =
            oldData.data.userBookmarkStatus?.isBookmarked || false;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              _count: {
                ...oldData.data._count,
                bookmarks: hasUserBookmarked
                  ? Math.max(0, currentBookmarkCount - 1)
                  : currentBookmarkCount + 1,
              },
              userBookmarkStatus: {
                isBookmarked: !hasUserBookmarked,
              },
            },
          };
        }
      );

      return {
        previousPoll,
        pollId,
        optimisticUpdate: true,
      };
    },

    onSuccess: (data) => {
      if (data.success && data.data) {
        queryClient.setQueryData<GetPollResponse>(
          pollQueryKeys.poll(pollId),
          (oldData) => {
            if (!oldData?.success || !oldData.data) return oldData;

            return {
              ...oldData,
              data: {
                ...oldData.data,
                userBookmarkStatus: {
                  isBookmarked: data.data!.isBookmarked,
                },
              },
            };
          }
        );
      }

      queryClient.invalidateQueries({
        queryKey: pollQueryKeys.poll(pollId),
      });
    },

    onError: (error, _variables, context) => {
      if (context?.previousPoll) {
        queryClient.setQueryData<GetPollResponse>(
          pollQueryKeys.poll(pollId),
          context.previousPoll
        );
      }
      console.error("북마크 처리 실패:", error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: pollQueryKeys.poll(pollId),
      });
    },
  });

  const currentPoll = queryClient.getQueryData<GetPollResponse>(
    pollQueryKeys.poll(pollId)
  );

  const isBookmarked =
    (currentPoll?.success &&
      currentPoll.data?.userBookmarkStatus?.isBookmarked) ||
    false;
  const bookmarkCount =
    (currentPoll?.success && currentPoll.data?._count?.bookmarks) || 0;

  return {
    isBookmarked,
    bookmarkCount,
    isProcessing: bookmarkMutation.isPending,
    handleBookmark: bookmarkMutation.mutate,
    error: bookmarkMutation.error,
    isError: bookmarkMutation.isError,
  };
};

export type UseBookmarkReturn = ReturnType<typeof useBookmark>;
