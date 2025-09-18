"use client";

import { PollContent } from "@/components/legacy/PollContent";
import { PollLoadingFallback } from "@/components/legacy/PollLoadingFallback";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

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

export default function PollPage() {
  return (
    <ErrorBoundary FallbackComponent={PollErrorFallback}>
      <Suspense fallback={<PollLoadingFallback />}>
        <PollContent />
      </Suspense>
    </ErrorBoundary>
  );
}
