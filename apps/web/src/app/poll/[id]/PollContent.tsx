"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPoll } from "@/actions/poll";

interface PollContentProps {
  pollId: string;
}

function PollErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="text-lg font-medium text-red-600">투표 데이터를 불러오는 중 오류가 발생했습니다.</div>
            <div className="text-gray-600">{error.message || "잠시 후 다시 시도해주세요."}</div>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{poll.title}</h1>

          {poll.description && <p className="text-gray-600 mb-6">{poll.description}</p>}

          <div className="space-y-4">
            <div className="text-sm text-gray-500">작성자: {poll.creator.name}</div>

            <div className="text-sm text-gray-500">총 투표 수: {poll._count.votes}</div>

            {poll.options && poll.options.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">투표 옵션:</h3>
                {poll.options.map((option) => (
                  <div key={option.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>{option.description}</span>
                      <span className="text-sm text-gray-500">{option._count.votes}표</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
