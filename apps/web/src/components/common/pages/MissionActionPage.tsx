"use client";

import { ActionRenderer } from "@/components/common/templates/action";
import { ActionProvider } from "@/components/common/templates/action/common/ActionContext";
import { ProgressBarProvider } from "@/components/common/templates/action/common/ProgressBarProvider";
import type { ActionAnswerItem, ActionDetail } from "@/types/dto";
import { useMemo, useState } from "react";

export interface MissionActionPageProps {
  actionData: ActionDetail;
  currentOrder?: number;
  totalActionCount?: number;
}

export function MissionActionPage({
  actionData,
  currentOrder = 0,
  totalActionCount = 1,
}: MissionActionPageProps) {
  const [canGoNext, setCanGoNext] = useState(false);

  const ActionComponent = ActionRenderer(actionData.type);

  const contextValue = useMemo(
    () => ({
      currentOrder,
      totalActionCount,
      isFirstAction: currentOrder === 0,
      onPrevious: () => {},
      onNext: () => {},
      onPrefetchNext: () => {},
      nextButtonText: currentOrder === totalActionCount - 1 ? "제출하기" : "다음",
      isLoading: false,
      isNextDisabled: !canGoNext,
      updateCanGoNext: (value: boolean) => setCanGoNext(value),
      onAnswerChange: (_answer: ActionAnswerItem) => {},
      missionResponse: undefined,
    }),
    [currentOrder, totalActionCount, canGoNext],
  );

  return (
    <div className="min-h-svh bg-white">
      <ProgressBarProvider>
        <ActionProvider value={contextValue}>
          <ActionComponent actionData={actionData} />
        </ActionProvider>
      </ProgressBarProvider>
    </div>
  );
}
