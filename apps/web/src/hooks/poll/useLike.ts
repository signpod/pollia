import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLikePoll } from "@/actions/poll";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import type { GetPollResponse } from "@/types/dto";

interface LikeResponse {
  success: boolean;
  data?: {
    isLiked: boolean;
    message: string;
  };
  error?: string;
}

interface LikeMutationContext {
  previousPoll: GetPollResponse | undefined;
  pollId: string;
  optimisticUpdate: boolean;
}

export const useLike = (pollId: string) => {
  const queryClient = useQueryClient();

  const likeMutation = useMutation<
    LikeResponse,
    Error,
    void,
    LikeMutationContext
  >({
    mutationFn: async () => {
      const result = await toggleLikePoll(pollId);
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

          const currentLikeCount = oldData.data._count?.likes || 0;
          const hasUserLiked = oldData.data.userLikeStatus?.isLiked || false;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              _count: {
                ...oldData.data._count,
                likes: hasUserLiked
                  ? Math.max(0, currentLikeCount - 1)
                  : currentLikeCount + 1,
              },
              userLikeStatus: {
                isLiked: !hasUserLiked,
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
                userLikeStatus: {
                  isLiked: data.data!.isLiked,
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
      console.error("좋아요 처리 실패:", error);
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

  const isLiked =
    (currentPoll?.success && currentPoll.data?.userLikeStatus?.isLiked) ||
    false;
  const likeCount =
    (currentPoll?.success && currentPoll.data?._count?.likes) || 0;

  return {
    isLiked,
    likeCount,
    isProcessing: likeMutation.isPending,
    handleLike: likeMutation.mutate,
    error: likeMutation.error,
    isError: likeMutation.isError,
  };
};

export type UseLikeReturn = ReturnType<typeof useLike>;
