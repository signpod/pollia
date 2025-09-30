import React, { useCallback, useState } from "react";
import { PollOptionProgressive } from "@/components/poll/PollOptionProgressive";
import { usePollResults, useUserVoteStatus } from "@/hooks/poll/usePoll";
import { isPollActive } from "@/lib/utils";
import { useMultipleVoting } from "@/hooks/poll/useMultipleVoting";
import { BasePollComponent } from "./BasePollComponent";
import { Button } from "@repo/ui/components";
import { Loader2Icon } from "lucide-react";

interface MultiplePollProps {
  pollId: string;
}

export function MultiplePoll({ pollId }: MultiplePollProps) {
  const { data: userVoteStatus } = useUserVoteStatus(pollId);
  const { data: pollResults } = usePollResults(pollId);
  const { handleVoteToggle, isVoting } = useMultipleVoting(pollId);

  const [selectedOptionIds, setSelectedOptionIds] = useState<Set<string>>(
    new Set()
  );

  const hasVoted = userVoteStatus?.success && userVoteStatus?.data?.hasVoted;
  const options = pollResults?.data?.options || [];

  const pollActive = pollResults?.data
    ? isPollActive(
        pollResults.data.startDate
          ? new Date(pollResults.data.startDate)
          : null,
        pollResults.data.endDate ? new Date(pollResults.data.endDate) : null,
        pollResults.data.isIndefinite
      )
    : false;

  const getPercentage = useCallback(
    (optionId: string): number | undefined => {
      if (!hasVoted) {
        return undefined;
      }

      if (!pollResults?.success || !pollResults?.data?.options?.length) {
        return undefined;
      }

      const targetOption = pollResults.data.options.find(
        (option) => option.id === optionId
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
    [hasVoted, pollResults]
  );

  const isSelected = useCallback(
    (optionId: string): boolean => {
      return !!userVoteStatus?.data?.votes?.find(
        (vote) => vote.option.id === optionId
      );
    },
    [userVoteStatus]
  );

  const handleOptionToggle = useCallback(
    (optionId: string) => {
      if (hasVoted || !pollActive || isVoting) return;

      setSelectedOptionIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(optionId)) {
          newSet.delete(optionId);
        } else {
          newSet.add(optionId);
        }
        return newSet;
      });
    },
    [hasVoted, pollActive, isVoting]
  );

  const handleSubmitVotes = useCallback(async () => {
    if (!pollActive || isVoting || selectedOptionIds.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedOptionIds).map((optionId) =>
          handleVoteToggle(optionId)
        )
      );

      setSelectedOptionIds(new Set());
    } catch (error) {
      console.error("투표 제출 실패:", error);
    }
  }, [pollActive, isVoting, selectedOptionIds, handleVoteToggle]);

  const handleResetVotes = useCallback(async () => {
    if (!pollActive || isVoting || !hasVoted) return;

    const userVotes = userVoteStatus?.data?.votes || [];

    try {
      await Promise.all(
        userVotes.map((vote) => handleVoteToggle(vote.option.id))
      );
    } catch (error) {
      console.error("투표 취소 실패:", error);
    }
  }, [pollActive, isVoting, hasVoted, userVoteStatus, handleVoteToggle]);

  const isVotingAllowed = pollActive && !isVoting;
  const canSubmit = !hasVoted && selectedOptionIds.size > 0 && isVotingAllowed;

  const isTempSelected = (optionId: string): boolean =>
    !hasVoted && selectedOptionIds.has(optionId);

  return (
    <BasePollComponent pollId={pollId}>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionToggle(option.id)}
              className={`w-full text-left rounded-sm transition-all duration-200 ${
                !isVotingAllowed || hasVoted ? "cursor-not-allowed" : ""
              } ${isTempSelected(option.id) ? "ring-2 ring-violet-500" : ""}`}
              disabled={!isVotingAllowed || hasVoted}
            >
              <PollOptionProgressive
                label={option.description}
                percentage={getPercentage(option.id)}
                selected={isSelected(option.id)}
                imageUrl={option.imageUrl ?? undefined}
              />
            </button>
          ))}
        </div>

        {!hasVoted ? (
          <Button
            onClick={handleSubmitVotes}
            disabled={!canSubmit}
            className="w-full "
            variant={canSubmit ? "primary" : "secondary"}
          >
            {isVoting ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              `${selectedOptionIds.size ? `${selectedOptionIds.size}개` : ""} 투표하기`
            )}
          </Button>
        ) : (
          <Button
            onClick={handleResetVotes}
            disabled={!isVotingAllowed}
            className="w-full mt-2"
            variant="secondary"
          >
            {isVoting ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              "재투표하기"
            )}
          </Button>
        )}
      </div>
    </BasePollComponent>
  );
}
