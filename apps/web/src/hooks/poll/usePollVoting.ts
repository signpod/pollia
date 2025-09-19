import { usePollMutations } from "./usePollMutations";

export const usePollVoting = (poll: any) => {
  const mutations = usePollMutations(poll.id);

  const handleVote = async (optionId: string) => {
    const isCurrentlyVoted = poll.userVotedOptionIds.includes(optionId);

    try {
      if (isCurrentlyVoted) {
        await mutations.unvote.mutateAsync({ optionId });
      } else {
        if (!poll.allowMultipleVote) {
          // 단일 선택의 경우 기존 투표를 모두 취소
          for (const currentOptionId of poll.userVotedOptionIds) {
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
    return poll.userVotedOptionIds.includes(optionId);
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
