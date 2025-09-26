import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitVote, removeVote } from "@/actions/poll";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import type {
  GetUserVoteStatusResponse,
  GetPollResultsResponse,
} from "@/types/dto/poll";

function useVoteMutation(pollId: string) {
  const queryClient = useQueryClient();

  const invalidatePoll = () => {
    queryClient.invalidateQueries({ queryKey: pollQueryKeys.poll(pollId) });
    queryClient.invalidateQueries({
      queryKey: pollQueryKeys.pollResults(pollId),
    });
    queryClient.invalidateQueries({
      queryKey: pollQueryKeys.userVoteStatus(pollId),
    });
  };

  const voteMutation = useMutation({
    mutationFn: ({ optionId }: { optionId: string }) => {
      return submitVote({ pollId, optionId });
    },
    onSuccess: () => {
      invalidatePoll();
    },
    onError: (error) => {
      console.error("투표 실패:", error);
    },
  });

  const unvoteMutation = useMutation({
    mutationFn: ({ optionId }: { optionId: string }) => {
      return removeVote({ pollId, optionId });
    },
    onSuccess: () => {
      invalidatePoll();
    },
    onError: (error) => {
      console.error("투표 취소 실패:", error);
    },
  });

  return {
    voteMutation,
    unvoteMutation,
  };
}

export const usePollVoting = (pollId: string) => {
  const queryClient = useQueryClient();
  const mutations = useVoteMutation(pollId);

  const handleVote = async (optionId: string) => {
    const currentUserVoteData = queryClient.getQueryData(
      pollQueryKeys.userVoteStatus(pollId)
    );
    const currentPollResultsData = queryClient.getQueryData(
      pollQueryKeys.pollResults(pollId)
    );

    try {
      const currentVoteStatus =
        queryClient.getQueryData<GetUserVoteStatusResponse>(
          pollQueryKeys.userVoteStatus(pollId)
        );
      const pollResults = queryClient.getQueryData<GetPollResultsResponse>(
        pollQueryKeys.pollResults(pollId)
      );

      const hasVoted = currentVoteStatus?.data?.hasVoted;
      const currentVote = currentVoteStatus?.data?.votes?.[0];
      const currentOptionId = currentVote?.option?.id;

      // 선택된 옵션의 정보 찾기
      const selectedOption = pollResults?.data?.options?.find(
        (option) => option.id === optionId
      );

      const optimisticUpdate = (isVoting: boolean, votedOptionId?: string) => {
        queryClient.setQueryData<GetUserVoteStatusResponse>(
          pollQueryKeys.userVoteStatus(pollId),
          (old) => {
            if (!old) return old;

            return {
              ...old,
              data: {
                ...old.data,
                hasVoted: isVoting,
                votes:
                  isVoting && votedOptionId && selectedOption
                    ? [
                        {
                          id: `temp-${Date.now()}`,
                          option: {
                            id: votedOptionId,
                            description: selectedOption.description,
                            order: selectedOption.order,
                          },
                        },
                      ]
                    : [],
              },
            };
          }
        );

        queryClient.setQueryData<GetPollResultsResponse>(
          pollQueryKeys.pollResults(pollId),
          (old) => {
            if (!old?.data?.options) return old;

            return {
              ...old,
              data: {
                ...old.data,
                options: old.data.options.map((option) => {
                  if (option.id === votedOptionId && isVoting) {
                    return {
                      ...option,
                      _count: { votes: option._count.votes + 1 },
                    };
                  }
                  if (option.id === currentOptionId && hasVoted && !isVoting) {
                    return {
                      ...option,
                      _count: {
                        votes: Math.max(0, option._count.votes - 1),
                      },
                    };
                  }
                  if (
                    option.id === currentOptionId &&
                    hasVoted &&
                    isVoting &&
                    currentOptionId !== votedOptionId
                  ) {
                    return {
                      ...option,
                      _count: {
                        votes: Math.max(0, option._count.votes - 1),
                      },
                    };
                  }
                  return option;
                }),
                _count: {
                  ...old.data._count,
                  votes: isVoting
                    ? hasVoted
                      ? old.data._count.votes
                      : old.data._count.votes + 1
                    : Math.max(0, old.data._count.votes - 1),
                },
              },
            };
          }
        );
      };

      if (hasVoted && currentOptionId === optionId) {
        optimisticUpdate(false);
        await mutations.unvoteMutation.mutateAsync({ optionId });
      } else {
        optimisticUpdate(true, optionId);
        await mutations.voteMutation.mutateAsync({ optionId });
      }
    } catch (error) {
      console.error("투표 처리 실패:", error);

      if (currentUserVoteData) {
        queryClient.setQueryData(
          pollQueryKeys.userVoteStatus(pollId),
          currentUserVoteData
        );
      }
      if (currentPollResultsData) {
        queryClient.setQueryData(
          pollQueryKeys.pollResults(pollId),
          currentPollResultsData
        );
      }

      queryClient.invalidateQueries({
        queryKey: pollQueryKeys.userVoteStatus(pollId),
      });
      queryClient.invalidateQueries({
        queryKey: pollQueryKeys.pollResults(pollId),
      });
    }
  };

  const isVoting =
    mutations.voteMutation.isPending || mutations.unvoteMutation.isPending;

  return {
    handleVote,
    isVoting,
    mutations,
  };
};

export type UsePollVotingReturn = ReturnType<typeof usePollVoting>;
