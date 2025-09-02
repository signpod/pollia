import { usePollMutations } from "./usePollMutations";
import type { Poll } from "@/types/poll";

export const usePollVoting = (poll: Poll) => {
  const mutations = usePollMutations(poll.id);

  const handleVote = async (optionId: string) => {
    const isCurrentlyVoted = poll.userVote?.includes(optionId) || false;

    try {
      if (isCurrentlyVoted) {
        await mutations.unvote.mutateAsync({ optionId });
      } else {
        if (!poll.allowMultipleVote) {
          const currentVotes = poll.userVote || [];
          for (const currentOptionId of currentVotes) {
            if (currentOptionId !== optionId) {
              await mutations.unvote.mutateAsync({ optionId: currentOptionId });
            }
          }
        }

        await mutations.vote.mutateAsync({ optionId });
      }
    } catch (error) {
      console.error("투표 처리 실패:", error);
    }
  };

  const isUserVoted = (optionId: string) => {
    return poll.userVote?.includes(optionId) || false;
  };

  const isVoting = mutations.vote.isPending || mutations.unvote.isPending;

  return {
    handleVote,
    isUserVoted,
    isVoting,
    mutations,
  };
};

export type UsePollVotingReturn = ReturnType<typeof usePollVoting>;
