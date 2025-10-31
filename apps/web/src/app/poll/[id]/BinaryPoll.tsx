import React, { useCallback, useMemo } from "react";
import { PollType } from "@prisma/client";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { PollOptionProgressive } from "@/components/poll/PollOptionProgressive";
import { BINARY_OPTION_ORDER, BINARY_POLL_OPTIONS, isBinaryPollType } from "@/constants/poll";
import { useIndividualVoting } from "@/hooks/poll/useIndividualVoting";
import { usePollResults, useUserVoteStatus } from "@/hooks/poll/usePoll";
import { useAuth } from "@/hooks/user";
import { isPollActive } from "@/lib/utils";
import { BasePollComponent } from "./BasePollComponent";

interface BinaryPollProps {
  pollId: string;
}

export function BinaryPoll({ pollId }: BinaryPollProps) {
  const { withAuth } = useAuth();
  const { data: userVoteStatus } = useUserVoteStatus(pollId);
  const { data: pollResults } = usePollResults(pollId);
  const { handleVote, isVoting } = useIndividualVoting(pollId);

  const hasVoted = userVoteStatus?.hasVoted;
  const pollType: PollType | undefined = pollResults?.type;

  const pollActive = pollResults
    ? isPollActive(
        pollResults.startDate ? new Date(pollResults.startDate) : null,
        pollResults.endDate ? new Date(pollResults.endDate) : null,
        pollResults.isIndefinite,
      )
    : false;

  const isValidOptions = useMemo(() => {
    if (!pollResults?.options || !pollType || !isBinaryPollType(pollType)) {
      return false;
    }

    const expectedOptions = BINARY_POLL_OPTIONS[pollType as keyof typeof BINARY_POLL_OPTIONS];

    if (pollResults.options.length !== expectedOptions.length) {
      return false;
    }

    return expectedOptions.every(expectedOption => {
      const actualOption = pollResults.options.find(opt => opt.order === expectedOption.order);
      return actualOption?.description === expectedOption.description;
    });
  }, [pollResults, pollType]);

  const getUserVotedOption = useCallback((): number | null => {
    if (!hasVoted || !userVoteStatus?.votes?.length) {
      return null;
    }

    const userVote = userVoteStatus.votes[0];
    if (!userVote) {
      return null;
    }

    return userVote.option.order;
  }, [hasVoted, userVoteStatus]);

  const getPercentage = useCallback(
    (order: number) => {
      if (!hasVoted) {
        return undefined;
      }

      const votedOptionOrder = getUserVotedOption();

      if (votedOptionOrder !== order) {
        return undefined;
      }

      if (!pollResults?.options?.length) {
        return undefined;
      }

      const targetOption = pollResults.options.find(option => option.order === order);

      if (!targetOption) {
        return undefined;
      }

      const totalVotes = pollResults._count.votes;
      if (totalVotes === 0) {
        return undefined;
      }

      return Math.round((targetOption._count.votes / totalVotes) * 100);
    },
    [hasVoted, getUserVotedOption, pollResults],
  );

  const isSelected = useCallback(
    (order: number) => {
      if (!hasVoted) {
        return false;
      }

      const votedOptionOrder = getUserVotedOption();
      return votedOptionOrder === order;
    },
    [hasVoted, getUserVotedOption],
  );

  const getOptionIdByOrder = useCallback(
    (order: number): string | null => {
      if (!pollResults?.options) {
        return null;
      }

      const targetOption = pollResults.options.find(option => option.order === order);

      return targetOption?.id || null;
    },
    [pollResults],
  );

  const handleVoteAction = useCallback(
    async (order: number) => {
      withAuth(async () => {
        if (!pollActive || isVoting) return;

        const optionId = getOptionIdByOrder(order);
        if (!optionId) {
          return;
        }

        await handleVote(optionId);
      })();
    },
    [pollActive, isVoting, getOptionIdByOrder, handleVote, withAuth],
  );

  const getOptionLabel = useCallback(
    (order: number): string => {
      if (!pollResults?.options) {
        return "";
      }

      const targetOption = pollResults.options.find(option => option.order === order);

      return targetOption?.description || "";
    },
    [pollResults],
  );

  const isVotingAllowed = pollActive && !isVoting;

  if (!isValidOptions) {
    console.error("[500] Invalid options");
    return null;
  }

  return (
    <BasePollComponent pollId={pollId}>
      <div className="flex w-full flex-col gap-2">
        <button
          onClick={() => handleVoteAction(BINARY_OPTION_ORDER.POSITIVE)}
          className={`w-full text-left ${!isVotingAllowed ? "cursor-not-allowed opacity-50" : ""}`}
          disabled={!isVotingAllowed}
        >
          <PollOptionProgressive
            icon={ThumbsUp}
            label={getOptionLabel(BINARY_OPTION_ORDER.POSITIVE)}
            percentage={getPercentage(BINARY_OPTION_ORDER.POSITIVE)}
            selected={isSelected(BINARY_OPTION_ORDER.POSITIVE)}
          />
        </button>

        <button
          onClick={() => handleVoteAction(BINARY_OPTION_ORDER.NEGATIVE)}
          className={`w-full text-left ${!isVotingAllowed ? "cursor-not-allowed opacity-50" : ""}`}
          disabled={!isVotingAllowed}
        >
          <PollOptionProgressive
            icon={ThumbsDown}
            label={getOptionLabel(BINARY_OPTION_ORDER.NEGATIVE)}
            percentage={getPercentage(BINARY_OPTION_ORDER.NEGATIVE)}
            selected={isSelected(BINARY_OPTION_ORDER.NEGATIVE)}
          />
        </button>
      </div>
    </BasePollComponent>
  );
}
