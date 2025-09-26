import React from "react";
import { BasePollComponent } from "./BasePollComponent";

interface MultipleChoicePollProps {
  pollId: string;
}

export function MultipleChoicePoll({ pollId }: MultipleChoicePollProps) {
  return (
    <BasePollComponent pollId={pollId}>
      {/* TODO: 객관식 투표 UI 구현 */}
      <div className="text-sm text-gray-500">
        객관식 투표 컴포넌트 구현 예정
      </div>
    </BasePollComponent>
  );
}
