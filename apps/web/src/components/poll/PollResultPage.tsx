"use client";

import { Poll, PollResult } from "@/types/poll";
import { Card } from "@/components/ui/card";
import { PollHeader } from "@/components/poll/PollHeader";
import { PollOwner } from "@/components/poll/PollOwner";
import { PollStats } from "@/components/poll/PollStats";
import { CountdownTimer } from "@/components/poll/CountdownTimer";
import { LikeBookmarkActions } from "@/components/poll/LikeBookmarkActions";
import { OptionResult } from "@/components/poll/OptionResult";
import { Separator } from "@/components/ui/separator";
import { usePollVoting } from "@/hooks/poll/usePollVoting";
import { useLikeBookmark } from "@/hooks/poll/useLikeBookmark";

interface PollResultPageProps {
  poll: Poll;
  results: PollResult[];
}

export function PollResultPage({ poll, results }: PollResultPageProps) {
  const voting = usePollVoting(poll);
  const likeBookmark = useLikeBookmark(poll.id, poll);

  return (
    <div className="space-y-6">
      <Card className="poll-card">
        <PollHeader
          title={poll.title}
          description={poll.description}
          imageUrl={poll.imageUrl}
          isSponsored={poll.isSponsored}
        />

        <PollOwner owner={poll.owner} createdAt={poll.createdAt} />

        <Separator className="my-6" />

        <PollStats
          participantsCount={poll.participantsCount}
          commentCount={poll.commentCount}
          likeCount={likeBookmark.likeCount}
        />

        <CountdownTimer endAt={poll.endAt} isActive={!poll.isHidden} />

        <LikeBookmarkActions
          isLiked={likeBookmark.isLiked}
          isBookmarked={likeBookmark.isBookmarked}
          likeCount={likeBookmark.likeCount}
          onLike={likeBookmark.handleLike}
          onBookmark={likeBookmark.handleBookmark}
          isProcessing={likeBookmark.isProcessing}
        />
      </Card>

      {new Date(poll.endAt) < new Date() && (
        <Card className="p-4 bg-gray-50 border-dashed">
          <p className="text-center text-gray-600">이 투표는 종료되었습니다.</p>
        </Card>
      )}

      <div className="space-y-4">
        {results.map((result) => (
          <OptionResult
            key={result.option.id}
            result={{
              ...result,
              isUserVote: voting.isUserVoted(result.option.id),
            }}
            allowMultiple={poll.allowMultipleVote}
            onVote={voting.handleVote}
            isVoting={voting.isVoting}
          />
        ))}
      </div>
    </div>
  );
}
