import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitMultipleVote, removeMultipleVote } from "@/actions/poll/vote";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import type {
  GetUserVoteStatusResponse,
  GetPollResultsResponse,
} from "@/types/dto/poll";

function useMultipleVoteMutation(pollId: string) {
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

  const addVoteMutation = useMutation({
    mutationFn: ({ optionId }: { optionId: string }) => {
      return submitMultipleVote({ pollId, optionId });
    },
    onSuccess: () => {
      invalidatePoll();
    },
    onError: (error) => {
      console.error("투표 추가 실패:", error);
    },
  });

  const removeVoteMutation = useMutation({
    mutationFn: ({ optionId }: { optionId: string }) => {
      return removeMultipleVote({ pollId, optionId });
    },
    onSuccess: () => {
      invalidatePoll();
    },
    onError: (error) => {
      console.error("투표 제거 실패:", error);
    },
  });

  return {
    addVoteMutation,
    removeVoteMutation,
  };
}

export const useMultipleVoting = (pollId: string) => {
  const queryClient = useQueryClient();
  const mutations = useMultipleVoteMutation(pollId);

  const handleVoteToggle = async (optionId: string) => {
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

      const existingVote = currentVoteStatus?.votes?.find(
        (vote) => vote.option.id === optionId
      );

      const selectedOption = pollResults?.options?.find(
        (option: { id: string }) => option.id === optionId
      );

      const optimisticUpdate = (isAdding: boolean, targetOptionId: string) => {
        queryClient.setQueryData<GetUserVoteStatusResponse>(
          pollQueryKeys.userVoteStatus(pollId),
          (old) => {
            if (!old) return old;

            let updatedVotes = old.votes || [];

            if (isAdding && selectedOption) {
              updatedVotes = [
                ...updatedVotes,
                {
                  id: `temp-${Date.now()}`,
                  option: {
                    id: targetOptionId,
                    description: selectedOption.description,
                    order: selectedOption.order,
                  },
                },
              ];
            } else {
              updatedVotes = updatedVotes.filter(
                (vote) => vote.option.id !== targetOptionId
              );
            }

            return {
              hasVoted: updatedVotes.length > 0,
              votes: updatedVotes,
            };
          }
        );

        queryClient.setQueryData<GetPollResultsResponse>(
          pollQueryKeys.pollResults(pollId),
          (old) => {
            if (!old?.options) return old;

            return {
              ...old,
              data: {
                ...old,
                options: old.options.map((option) => {
                  if (option.id === targetOptionId) {
                    return {
                      ...option,
                      _count: {
                        votes: Math.max(
                          0,
                          option._count.votes + (isAdding ? 1 : -1)
                        ),
                      },
                    };
                  }
                  return option;
                }),
                _count: {
                  ...old._count,
                  votes: Math.max(0, old._count.votes + (isAdding ? 1 : -1)),
                },
              },
            };
          }
        );
      };

      if (existingVote) {
        optimisticUpdate(false, optionId);
        await mutations.removeVoteMutation.mutateAsync({ optionId });
      } else {
        optimisticUpdate(true, optionId);
        await mutations.addVoteMutation.mutateAsync({ optionId });
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
    mutations.addVoteMutation.isPending ||
    mutations.removeVoteMutation.isPending;

  return {
    handleVoteToggle,
    isVoting,
    mutations,
  };
};

export type UseMultipleVotingReturn = ReturnType<typeof useMultipleVoting>;
