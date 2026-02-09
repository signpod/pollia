"use client";

import { ActionProvider } from "@/app/mission/[missionId]/action/[actionId]/providers/ActionContext";
import { ProgressBarProvider } from "@/app/mission/[missionId]/action/[actionId]/providers/ProgressBarProvider";
import type { ActionAnswerItem, GetMissionResponseResponse } from "@/types/dto";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

interface ActionMockProviderProps {
  children: ReactNode;
  currentOrder?: number;
  totalActionCount?: number;
  isNextDisabled?: boolean;
  missionResponse?: GetMissionResponseResponse;
}

export function ActionMockProvider({
  children,
  currentOrder = 1,
  totalActionCount = 5,
  isNextDisabled = false,
  missionResponse,
}: ActionMockProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  const mockValue = {
    currentOrder,
    totalActionCount,
    isFirstAction: currentOrder === 0,
    onPrevious: () => console.log("Previous clicked"),
    onNext: () => console.log("Next clicked"),
    onPrefetchNext: () => {},
    nextButtonText: currentOrder === totalActionCount - 1 ? "제출하기" : "다음",
    isLoading: false,
    isNextDisabled,
    updateCanGoNext: (canGoNext: boolean) => console.log("Can go next:", canGoNext),
    onAnswerChange: (answer: ActionAnswerItem) => console.log("Answer changed:", answer),
    missionResponse,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-white">
        <ProgressBarProvider>
          <ActionProvider value={mockValue}>{children}</ActionProvider>
        </ProgressBarProvider>
      </div>
    </QueryClientProvider>
  );
}

export interface MockFileUpload {
  id: string;
  publicUrl: string;
  filePath: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export function createMockMissionResponse(
  actionId: string,
  fileUploads: MockFileUpload[],
): GetMissionResponseResponse {
  return {
    data: {
      id: "response-1",
      missionId: "mission-1",
      userId: "user-1",
      startedAt: new Date(),
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      answers: [
        {
          id: "answer-1",
          actionId,
          responseId: "response-1",
          createdAt: new Date(),
          textAnswer: null,
          scaleAnswer: null,
          booleanAnswer: null,
          dateAnswers: [],
          action: {} as never,
          options: [],
          fileUploads: fileUploads.map(f => {
            const name = f.fileName ?? f.filePath.split("/").pop() ?? "file";
            return {
              id: f.id,
              publicUrl: f.publicUrl,
              filePath: f.filePath,
              originalFileName: name,
              fileSize: f.fileSize ?? 1024 * 100,
              mimeType: f.mimeType ?? "application/octet-stream",
              bucket: "mock-bucket",
              createdAt: new Date(),
              userId: "user-1",
              status: "CONFIRMED" as const,
              confirmedAt: new Date(),
              actionAnswerId: "answer-1",
            };
          }),
        },
      ],
    },
  };
}
