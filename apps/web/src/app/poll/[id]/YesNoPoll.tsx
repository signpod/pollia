import React, { useCallback } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { PollOptionProgressive } from "@/components/poll/PollOptionProgressive";
import { usePollResults, useUserVoteStatus } from "@/hooks/poll/usePoll";
import {
  BINARY_OPTION_ORDER,
  BINARY_POLL_OPTIONS,
  isBinaryPollType,
} from "@/constants/poll";
import { PollType } from "@prisma/client";
import { isPollActive } from "@/lib/utils";
import { usePollVoting } from "@/hooks/poll/usePollVoting";
import { BasePollComponent } from "./BasePollComponent";

interface YesNoPollProps {
  pollId: string;
}

function getOrderForOptionType(optionType: "LIKE" | "DISLIKE"): number {
  return optionType === "LIKE"
    ? BINARY_OPTION_ORDER.POSITIVE
    : BINARY_OPTION_ORDER.NEGATIVE;
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

function getDefaultOptionText(
  pollType: PollType,
  optionType: "LIKE" | "DISLIKE"
): string {
  const order = getOrderForOptionType(optionType);
  return (
    getBinaryOptionByOrder(pollType, order) ||
    (optionType === "LIKE" ? "좋아요" : "별로예요")
  );
}

export function YesNoPoll({ pollId }: YesNoPollProps) {
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

  const getUserVotedOption = useCallback(() => {
    if (!hasVoted || !userVoteStatus?.data?.votes?.length) {
      return null;
    }

    const userVote = userVoteStatus.data.votes[0];
    if (!userVote) {
      return null;
    }

    const optionOrder = userVote.option.order;
    return optionOrder === 1 ? "LIKE" : "DISLIKE";
  }, [hasVoted, userVoteStatus]);

  const getPercentage = useCallback(
    (optionType: "LIKE" | "DISLIKE") => {
      if (!hasVoted) {
        return undefined;
      }

      const votedOption = getUserVotedOption();

      if (votedOption !== optionType) {
        return undefined;
      }

      if (!pollResults?.success || !pollResults?.data?.options?.length) {
        return undefined;
      }

      const targetOrderValue = getOrderForOptionType(optionType);
      const targetOption = pollResults.data.options.find(
        (option) => option.order === targetOrderValue
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
    (optionType: "LIKE" | "DISLIKE") => {
      if (!hasVoted) {
        return false;
      }

      const votedOption = getUserVotedOption();
      return votedOption === optionType;
    },
    [hasVoted, getUserVotedOption]
  );

  const getOptionIdByType = useCallback(
    (optionType: "LIKE" | "DISLIKE"): string | null => {
      if (!pollResults?.data?.options || !pollType) {
        return null;
      }

      const targetOrderValue = getOrderForOptionType(optionType);
      const targetOption = pollResults.data.options.find(
        (option) => option.order === targetOrderValue
      );

      return targetOption?.id || null;
    },
    [pollResults, pollType]
  );

  const handleVoteAction = useCallback(
    async (optionType: "LIKE" | "DISLIKE") => {
      if (!pollActive || isVoting) return;

      const optionId = getOptionIdByType(optionType);
      if (!optionId) {
        return;
      }

      await handleVote(optionId);
    },
    [pollActive, isVoting, getOptionIdByType, handleVote]
  );

  const getOptionLabel = useCallback(
    (optionType: "LIKE" | "DISLIKE"): string => {
      if (
        !pollResults?.success ||
        !pollResults?.data?.options?.length ||
        !pollType
      ) {
        return pollType
          ? getDefaultOptionText(pollType, optionType)
          : optionType === "LIKE"
            ? "좋아요"
            : "별로예요";
      }

      const targetOrderValue = getOrderForOptionType(optionType);
      const targetOption = pollResults.data.options.find(
        (option) => option.order === targetOrderValue
      );

      return (
        targetOption?.description || getDefaultOptionText(pollType, optionType)
      );
    },
    [pollResults, pollType]
  );

  const isVotingAllowed = pollActive && !isVoting;

  return (
    <BasePollComponent pollId={pollId}>
      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={() => handleVoteAction("LIKE")}
          className={`w-full text-left ${!isVotingAllowed ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!isVotingAllowed}
        >
          <PollOptionProgressive
            icon={ThumbsUp}
            label={getOptionLabel("LIKE")}
            percentage={getPercentage("LIKE")}
            selected={isSelected("LIKE")}
          />
        </button>

        <button
          onClick={() => handleVoteAction("DISLIKE")}
          className={`w-full text-left ${!isVotingAllowed ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!isVotingAllowed}
        >
          <PollOptionProgressive
            icon={ThumbsDown}
            label={getOptionLabel("DISLIKE")}
            percentage={getPercentage("DISLIKE")}
            selected={isSelected("DISLIKE")}
          />
        </button>
      </div>
    </BasePollComponent>
  );
}
