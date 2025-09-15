"use client";

import {
  Poll,
  PollResult,
  PollResultOptionApiResponse,
} from "@/types/dto/poll";
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
  results: PollResultOptionApiResponse;
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
        {results.map((apiResult, index) => {
          // API 응답을 PollResult 형태로 변환
          const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);
          const percentage =
            totalVotes > 0 ? (apiResult.voteCount / totalVotes) * 100 : 0;

          const pollResult: PollResult = {
            option: {
              id: apiResult.id,
              title: apiResult.title,
              voteCount: apiResult.voteCount,
              ...(apiResult.description && {
                description: apiResult.description,
              }),
              ...(apiResult.imageUrl && { imageUrl: apiResult.imageUrl }),
              ...(apiResult.externalLinkTitle && {
                externalLinkTitle: apiResult.externalLinkTitle,
              }),
              ...(apiResult.externalLinkUrl && {
                externalLinkUrl: apiResult.externalLinkUrl,
              }),
            },
            percentage: Math.round(percentage * 10) / 10,
            rank: index + 1,
            isUserVote: voting.isUserVoted(apiResult.id),
          };

          return (
            <OptionResult
              key={apiResult.id}
              result={pollResult}
              allowMultiple={poll.allowMultipleVote}
              onVote={voting.handleVote}
              isVoting={voting.isVoting}
            />
          );
        })}
      </div>
    </div>
  );
}
