import React from "react";
import { BasePollComponent } from "./BasePollComponent";

interface LikeDislikePollProps {
  pollId: string;
}

export function LikeDislikePoll({ pollId }: LikeDislikePollProps) {
  return (
    <BasePollComponent pollId={pollId}>
      {/* TODO: 호불호 투표 UI 구현 */}
      <div className="text-sm text-gray-500">
        호불호 투표 컴포넌트 구현 예정
      </div>
    </BasePollComponent>
  );
}
