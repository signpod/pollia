"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPoll } from "@/actions/poll";
import { PollType } from "@prisma/client";
import {
  YesNoPoll,
  LikeDislikePoll,
  MultipleChoicePoll,
} from "./PollComponents";

interface PollContentProps {
  pollId: string;
}

function PollErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="text-lg font-medium text-red-600">
              투표 데이터를 불러오는 중 오류가 발생했습니다.
            </div>
            <div className="text-gray-600">
              {error.message || "잠시 후 다시 시도해주세요."}
            </div>
            <button
              onClick={resetErrorBoundary}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PollData({ pollId }: { pollId: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ["poll", pollId],
    queryFn: () => getPoll(pollId),
  });

  if (!data?.success || !data.data) {
    throw new Error(data?.error || "투표를 불러올 수 없습니다.");
  }

  const poll = data.data;

  const renderPollByType = () => {
    switch (poll.type) {
      case PollType.YES_NO:
        return <YesNoPoll poll={poll} />;

      case PollType.LIKE_DISLIKE:
        return <LikeDislikePoll poll={poll} />;

      case PollType.MULTIPLE_CHOICE:
        return <MultipleChoicePoll poll={poll} />;

      default:
        return (
          <div className="text-center text-red-600">
            지원하지 않는 투표 타입입니다.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {poll.title}
          </h1>

          {poll.description && (
            <p className="text-gray-600 mb-6">{poll.description}</p>
          )}

          <div className="space-y-6">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>작성자: {poll.creator.name}</span>
              <span>총 투표 수: {poll._count.votes}</span>
            </div>

            {renderPollByType()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PollContent({ pollId }: PollContentProps) {
  return (
    <ErrorBoundary FallbackComponent={PollErrorFallback}>
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <PollData pollId={pollId} />
      </Suspense>
    </ErrorBoundary>
  );
}
