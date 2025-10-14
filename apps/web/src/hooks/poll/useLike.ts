import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLikePoll } from "@/actions/poll";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import type {
  ToggleLikePollResponse,
  GetPollUserStatusResponse,
} from "@/types/dto";

interface LikeMutationContext {
  previousUserStatus: GetPollUserStatusResponse | undefined;
  pollId: string;
  optimisticUpdate: boolean;
}

export const useLike = (pollId: string) => {
  const queryClient = useQueryClient();

  const likeMutation = useMutation<
    ToggleLikePollResponse,
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
            isLiked: !oldData.isLiked,
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
      queryClient.invalidateQueries({
        queryKey: pollQueryKeys.likedPolls(),
      });
    },

    onError: (error, _variables, context) => {
      if (context?.previousUserStatus) {
        queryClient.setQueryData<GetPollUserStatusResponse>(
          pollQueryKeys.userPollStatus(pollId),
          context.previousUserStatus
        );
      }
      console.error("좋아요 처리 실패:", error);
    },
  });

  const userStatus = queryClient.getQueryData<GetPollUserStatusResponse>(
    pollQueryKeys.userPollStatus(pollId)
  );

  const isLiked = userStatus?.isLiked || false;

  return {
    isLiked,
    isProcessing: likeMutation.isPending,
    handleLike: likeMutation.mutate,
    error: likeMutation.error,
    isError: likeMutation.isError,
  };
};

export type UseLikeReturn = ReturnType<typeof useLike>;
