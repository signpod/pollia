import React, { useCallback, useState } from "react";
import { PollOptionProgressive } from "@/components/poll/PollOptionProgressive";
import { usePollResults, useUserVoteStatus } from "@/hooks/poll/usePoll";
import { isPollActive } from "@/lib/utils";
import { useMultipleVoting } from "@/hooks/poll/useMultipleVoting";
import { BasePollComponent } from "./BasePollComponent";
import { Button } from "@repo/ui/components";

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
  const maxSelections = pollResults?.data?.maxSelections || 1;

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
      if (!pollActive || isVoting) return;

      if (!hasVoted)
        setSelectedOptionIds((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(optionId)) {
            newSet.delete(optionId);
          } else {
            if (newSet.size >= maxSelections) {
              console.warn(`최대 ${maxSelections}개까지만 선택할 수 있습니다.`);
              return newSet;
            }
            newSet.add(optionId);
          }
          return newSet;
        });
    },
    [hasVoted, pollActive, isVoting, maxSelections]
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

  const isOptionDisabled = useCallback(
    (optionId: string): boolean => {
      if (!pollActive || isVoting) return true;
      if (hasVoted) {
        return false;
      } else {
        if (selectedOptionIds.has(optionId)) return false;
        return selectedOptionIds.size >= maxSelections;
      }
    },
    [hasVoted, pollActive, isVoting, selectedOptionIds, maxSelections]
  );

  return (
    <BasePollComponent pollId={pollId}>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionToggle(option.id)}
              className={`w-full text-left rounded-sm transition-all duration-200 ${
                isOptionDisabled(option.id)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              } ${isTempSelected(option.id) ? "ring-2 ring-violet-500" : ""}`}
              disabled={isOptionDisabled(option.id)}
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
            loading={isVoting}
          >
            {selectedOptionIds.size ? `${selectedOptionIds.size}개` : ""}
            투표하기
          </Button>
        ) : (
          <Button
            onClick={handleResetVotes}
            disabled={!isVotingAllowed}
            className="w-full mt-2"
            variant="secondary"
            loading={isVoting}
          >
            재투표하기
          </Button>
        )}
      </div>
    </BasePollComponent>
  );
}
