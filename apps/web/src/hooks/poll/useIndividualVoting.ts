import { removeIndividualVote, submitIndividualVote } from "@/actions/poll/vote";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import type { GetPollResultsResponse, GetUserVoteStatusResponse } from "@/types/dto/poll";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      return submitIndividualVote({ pollId, optionId });
    },
    onSuccess: () => {
      invalidatePoll();
    },
    onError: error => {
      console.error("투표 실패:", error);
    },
  });

  const unvoteMutation = useMutation({
    mutationFn: ({ optionId }: { optionId: string }) => {
      return removeIndividualVote({ pollId, optionId });
    },
    onSuccess: () => {
      invalidatePoll();
    },
    onError: error => {
      console.error("투표 취소 실패:", error);
    },
  });

  return {
    voteMutation,
    unvoteMutation,
  };
}

export const useIndividualVoting = (pollId: string) => {
  const queryClient = useQueryClient();
  const mutations = useVoteMutation(pollId);

  const handleVote = async (optionId: string) => {
    const currentUserVoteData = queryClient.getQueryData(pollQueryKeys.userVoteStatus(pollId));
    const currentPollResultsData = queryClient.getQueryData(pollQueryKeys.pollResults(pollId));

    try {
      const currentVoteStatus = queryClient.getQueryData<GetUserVoteStatusResponse>(
        pollQueryKeys.userVoteStatus(pollId),
      );
      const pollResults = queryClient.getQueryData<GetPollResultsResponse>(
        pollQueryKeys.pollResults(pollId),
      );

      const hasVoted = currentVoteStatus?.hasVoted;
      const currentVote = currentVoteStatus?.votes?.[0];
      const currentOptionId = currentVote?.option?.id;

      const selectedOption = pollResults?.options?.find(option => option.id === optionId);

      const optimisticUpdate = (isVoting: boolean, votedOptionId?: string) => {
        queryClient.setQueryData<GetUserVoteStatusResponse>(
          pollQueryKeys.userVoteStatus(pollId),
          old => {
            if (!old) return old;

            return {
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
            };
          },
        );

        queryClient.setQueryData<GetPollResultsResponse>(pollQueryKeys.pollResults(pollId), old => {
          if (!old?.options) return old;

          return {
            ...old,
            data: {
              ...old,
              options: old.options.map(option => {
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
                ...old._count,
                votes: isVoting
                  ? hasVoted
                    ? old._count.votes
                    : old._count.votes + 1
                  : Math.max(0, old._count.votes - 1),
              },
            },
          };
        });
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
        queryClient.setQueryData(pollQueryKeys.userVoteStatus(pollId), currentUserVoteData);
      }
      if (currentPollResultsData) {
        queryClient.setQueryData(pollQueryKeys.pollResults(pollId), currentPollResultsData);
      }

      queryClient.invalidateQueries({
        queryKey: pollQueryKeys.userVoteStatus(pollId),
      });
      queryClient.invalidateQueries({
        queryKey: pollQueryKeys.pollResults(pollId),
      });
    }
  };

  const isVoting = mutations.voteMutation.isPending || mutations.unvoteMutation.isPending;

  return {
    handleVote,
    isVoting,
    mutations,
  };
};

export type UseIndividualVotingReturn = ReturnType<typeof useIndividualVoting>;
