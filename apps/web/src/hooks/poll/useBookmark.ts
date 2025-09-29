import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleBookmarkPoll } from "@/actions/poll";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import type {
  ToggleBookmarkPollResponse,
  GetPollUserStatusResponse,
} from "@/types/dto";

interface BookmarkMutationContext {
  previousUserStatus: GetPollUserStatusResponse | undefined;
  pollId: string;
  optimisticUpdate: boolean;
}

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

      const previousUserStatus =
        queryClient.getQueryData<GetPollUserStatusResponse>(
          pollQueryKeys.userPollStatus(pollId)
        );

      queryClient.setQueryData<GetPollUserStatusResponse>(
        pollQueryKeys.userPollStatus(pollId),
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            isBookmarked: !oldData.isBookmarked,
          };
        }
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
    },

    onError: (error, _variables, context) => {
      if (context?.previousUserStatus) {
        queryClient.setQueryData<GetPollUserStatusResponse>(
          pollQueryKeys.userPollStatus(pollId),
          context.previousUserStatus
        );
      }
      console.error("북마크 처리 실패:", error);
    },
  });

  const userStatus = queryClient.getQueryData<GetPollUserStatusResponse>(
    pollQueryKeys.userPollStatus(pollId)
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
