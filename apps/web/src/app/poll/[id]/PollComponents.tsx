import React, { useCallback } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { PollOptionProgressive } from "@/components/poll/PollOptionProgressive";
import { Typo } from "@repo/ui/components";
import {
  useGetPoll,
  usePollResults,
  useUserVoteStatus,
} from "@/hooks/poll/usePoll";
import Image from "next/image";
import {
  BINARY_OPTION_ORDER,
  BINARY_POLL_OPTIONS,
  isBinaryPollType,
} from "@/constants/poll";
import { PollType } from "@prisma/client";
import { isPollActive } from "@/lib/utils";
import { usePollVoting } from "@/hooks/poll/usePollVoting";
import { TimeDisplay } from "@/components/common/TimeDisplay";

interface BasePollComponentProps extends React.PropsWithChildren {
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

function BasePollComponent({ pollId, children }: BasePollComponentProps) {
  const { data: poll } = useGetPoll(pollId);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Typo.MainTitle size="medium">{poll?.data?.title}</Typo.MainTitle>
        {poll?.data?.description && (
          <Typo.Body size="large">{poll?.data?.description}</Typo.Body>
        )}
      </div>

      {poll?.data?.imageUrl && (
        <div className="w-full @container">
          <Image
            src={poll?.data?.imageUrl}
            alt={poll?.data?.title}
            width={400}
            height={400}
            className="w-full h-auto object-contain rounded-sm max-h-[161.8cqw]"
          />
        </div>
      )}

      <div className="flex items-center justify-between text-sm font-semibold w-full">
        <div className="text-violet-500">
          {poll?.data?._count?.votes || 0}명 참여 중
        </div>
        <div className="text-zinc-400 text-right">1개 선택 가능</div>
      </div>

      {children}

      <div className="flex items-center justify-end w-full">
        <TimeDisplay
          startDate={
            poll?.data?.startDate ? new Date(poll.data.startDate) : null
          }
          endDate={poll?.data?.endDate ? new Date(poll.data.endDate) : null}
          isIndefinite={poll?.data?.isIndefinite ?? false}
        />
      </div>
    </div>
  );
}

export function YesNoPoll({ pollId }: BasePollComponentProps) {
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

  // optionType으로부터 실제 optionId 찾기
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

export function LikeDislikePoll({ pollId }: BasePollComponentProps) {
  return (
    <BasePollComponent pollId={pollId}>
      {/* TODO: 호불호 투표 UI 구현 */}
      <div className="text-sm text-gray-500">
        호불호 투표 컴포넌트 구현 예정
      </div>
    </BasePollComponent>
  );
}

export function MultipleChoicePoll({ pollId }: BasePollComponentProps) {
  return (
    <BasePollComponent pollId={pollId}>
      {/* TODO: 객관식 투표 UI 구현 */}
      <div className="text-sm text-gray-500">
        객관식 투표 컴포넌트 구현 예정
      </div>
    </BasePollComponent>
  );
}
