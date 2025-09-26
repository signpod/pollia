import React, { useCallback } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { PollOptionProgressive } from "@/components/poll/PollOptionProgressive";
import { usePollResults, useUserVoteStatus } from "@/hooks/poll/usePoll";
import {
  BINARY_OPTION_ORDER,
  BINARY_POLL_OPTIONS,
  FALLBACK_OPTION_TEXT,
  isBinaryPollType,
} from "@/constants/poll";
import { PollType } from "@prisma/client";
import { isPollActive } from "@/lib/utils";
import { usePollVoting } from "@/hooks/poll/usePollVoting";
import { BasePollComponent } from "./BasePollComponent";

interface BinaryPollProps {
  pollId: string;
}

function getBinaryOptionByOrder(
  pollType: PollType,
  order: number
): string | null {
  if (!isBinaryPollType(pollType)) {
    return null;
  }

  const options =
    BINARY_POLL_OPTIONS[pollType as keyof typeof BINARY_POLL_OPTIONS];
  const option = options.find((opt) => opt.order === order);
  return option?.description || null;
}

function getDefaultOptionText(pollType: PollType, order: number): string {
  const pollTypeText = getBinaryOptionByOrder(pollType, order);
  if (pollTypeText) {
    return pollTypeText;
  }

  const fallbackText = getBinaryOptionByOrder(PollType.LIKE_DISLIKE, order);
  return (
    fallbackText ||
    FALLBACK_OPTION_TEXT[order as keyof typeof FALLBACK_OPTION_TEXT]
  );
}

export function BinaryPoll({ pollId }: BinaryPollProps) {
  const { data: userVoteStatus } = useUserVoteStatus(pollId);
  const { data: pollResults } = usePollResults(pollId);
  const { handleVote, isVoting } = usePollVoting(pollId);

  const hasVoted = userVoteStatus?.success && userVoteStatus?.data?.hasVoted;
  const pollType: PollType | undefined = pollResults?.data?.type;

  const pollActive = pollResults?.data
    ? isPollActive(
        pollResults.data.startDate
          ? new Date(pollResults.data.startDate)
          : null,
        pollResults.data.endDate ? new Date(pollResults.data.endDate) : null,
        pollResults.data.isIndefinite
      )
    : false;

  const getUserVotedOption = useCallback((): number | null => {
    if (!hasVoted || !userVoteStatus?.data?.votes?.length) {
      return null;
    }

    const userVote = userVoteStatus.data.votes[0];
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

      if (!pollResults?.success || !pollResults?.data?.options?.length) {
        return undefined;
      }

      const targetOption = pollResults.data.options.find(
        (option) => option.order === order
      );

      if (!targetOption) {
        return undefined;
      }

      const totalVotes = pollResults.data._count.votes;
      if (totalVotes === 0) {
        return undefined;
      }

      return Math.round((targetOption._count.votes / totalVotes) * 100);
    },
    [hasVoted, getUserVotedOption, pollResults]
  );

  const isSelected = useCallback(
    (order: number) => {
      if (!hasVoted) {
        return false;
      }

      const votedOptionOrder = getUserVotedOption();
      return votedOptionOrder === order;
    },
    [hasVoted, getUserVotedOption]
  );

  const getOptionIdByOrder = useCallback(
    (order: number): string | null => {
      if (!pollResults?.data?.options || !pollType) {
        return null;
      }

      const targetOption = pollResults.data.options.find(
        (option) => option.order === order
      );

      return targetOption?.id || null;
    },
    [pollResults, pollType]
  );

  const handleVoteAction = useCallback(
    async (order: number) => {
      if (!pollActive || isVoting) return;

      const optionId = getOptionIdByOrder(order);
      if (!optionId) {
        return;
      }

      await handleVote(optionId);
    },
    [pollActive, isVoting, getOptionIdByOrder, handleVote]
  );

  const getOptionLabel = useCallback(
    (order: number): string => {
      if (
        !pollResults?.success ||
        !pollResults?.data?.options?.length ||
        !pollType
      ) {
        // pollType이 없을 때도 getDefaultOptionText 사용 (내부에서 fallback 처리)
        return getDefaultOptionText(pollType || PollType.LIKE_DISLIKE, order);
      }

      const targetOption = pollResults.data.options.find(
        (option) => option.order === order
      );

      return targetOption?.description || getDefaultOptionText(pollType, order);
    },
    [pollResults, pollType]
  );

  const isVotingAllowed = pollActive && !isVoting;

  return (
    <BasePollComponent pollId={pollId}>
      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={() => handleVoteAction(BINARY_OPTION_ORDER.POSITIVE)}
          className={`w-full text-left ${!isVotingAllowed ? "opacity-50 cursor-not-allowed" : ""}`}
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
          className={`w-full text-left ${!isVotingAllowed ? "opacity-50 cursor-not-allowed" : ""}`}
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
