"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PollType } from "@prisma/client";

import { useGetPoll } from "@/hooks/poll/usePoll";

import { BinaryPoll } from "./BinaryPoll";
import { MultipleChoicePoll } from "./MultipleChoicePoll";

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
  const { data: poll } = useGetPoll(pollId);

  if (!poll?.success || !poll.data) {
    throw new Error(poll?.error || "투표를 불러올 수 없습니다.");
  }

  const renderPollByType = () => {
    switch (poll.data.type) {
      case PollType.YES_NO:
      case PollType.LIKE_DISLIKE:
        return <BinaryPoll pollId={pollId} />;

      case PollType.MULTIPLE_CHOICE:
        return <MultipleChoicePoll pollId={pollId} />;

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
        <div className="bg-white rounded-lg p-6">{renderPollByType()}</div>
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
