import { toggleLikePoll } from "@/actions/poll";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import type { GetPollUserStatusResponse, ToggleLikePollResponse } from "@/types/dto";
import { toast } from "@repo/ui/components";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LikeMutationContext {
  previousUserStatus: GetPollUserStatusResponse | undefined;
  pollId: string;
  optimisticUpdate: boolean;
}

const LIKE_MESSAGES = {
  success: {
    like: "좋아요를 눌렀어요.",
    cancel: "좋아요를 취소했어요.",
  },
  error: "좋아요 처리 중 오류가 발생했어요.",
} as const;

export const useLike = (pollId: string) => {
  const queryClient = useQueryClient();

  const likeMutation = useMutation<ToggleLikePollResponse, Error, void, LikeMutationContext>({
    mutationFn: async () => {
      const result = await toggleLikePoll(pollId);
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
            isLiked: !oldData.isLiked,
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
        queryKey: pollQueryKeys.likedPolls(),
      });
      const message = isLiked ? LIKE_MESSAGES.success.like : LIKE_MESSAGES.success.cancel;
      toast.success(message);
    },

    onError: (_, _variables, context) => {
      if (context?.previousUserStatus) {
        queryClient.setQueryData<GetPollUserStatusResponse>(
          pollQueryKeys.userPollStatus(pollId),
          context.previousUserStatus,
        );
      }
      toast.error(LIKE_MESSAGES.error);
    },
  });

  const userStatus = queryClient.getQueryData<GetPollUserStatusResponse>(
    pollQueryKeys.userPollStatus(pollId),
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
