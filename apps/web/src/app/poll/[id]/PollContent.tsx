"use client";

import { useGetPoll } from "@/hooks/poll/usePoll";
import { PollType } from "@prisma/client";
import { FixedBottomLayout } from "@repo/ui/components";
import { ErrorBoundary } from "react-error-boundary";
import { BinaryPoll } from "./BinaryPoll";
import { BottomCTAButtons } from "./BottomCTAButtons";
import { MultiplePoll } from "./MultiplePoll";

interface PollContentProps {
  pollId: string;
}

//TODO: 에러 핸들링 구현
function PollErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex min-h-96 items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="text-lg font-medium text-red-600">
              투표 데이터를 불러오는 중 오류가 발생했습니다.
            </div>
            <div className="text-gray-600">{error.message || "잠시 후 다시 시도해주세요."}</div>
            <button
              type="button"
              onClick={resetErrorBoundary}
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
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

  if (!poll?.data) {
    throw new Error("투표를 불러올 수 없습니다.");
  }

  const renderPollByType = () => {
    switch (poll.data.type) {
      case PollType.YES_NO:
      case PollType.LIKE_DISLIKE:
        return <BinaryPoll pollId={pollId} />;

      case PollType.MULTIPLE_CHOICE:
        return <MultiplePoll pollId={pollId} />;

      default:
        return <div className="text-center text-red-600">지원하지 않는 투표 타입입니다.</div>;
    }
  };

  return <div className="mx-5 rounded-lg bg-white p-4">{renderPollByType()}</div>;
}

export function PollContent({ pollId }: PollContentProps) {
  return (
    <ErrorBoundary FallbackComponent={PollErrorFallback}>
      <PollData pollId={pollId} />

      <FixedBottomLayout.Content>
        <BottomCTAButtons pollId={pollId} />
      </FixedBottomLayout.Content>
    </ErrorBoundary>
  );
}
