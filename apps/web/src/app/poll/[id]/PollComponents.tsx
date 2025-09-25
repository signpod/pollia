interface BasePollProps {
  poll: any;
}

export abstract class BasePollComponent {
  // TODO: 공통 로직 구현 예정
}

// O/X 투표 컴포넌트
export function YesNoPoll({ poll }: BasePollProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">O/X 투표</h2>
      <p className="text-gray-600">예/아니오로 투표하세요.</p>
      {/* TODO: O/X 투표 컴포넌트 구현 */}
    </div>
  );
}

// 호불호 투표 컴포넌트
export function LikeDislikePoll({ poll }: BasePollProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">호불호 투표</h2>
      <p className="text-gray-600">좋아요/싫어요로 투표하세요.</p>
      {/* TODO: 호불호 투표 컴포넌트 구현 */}
    </div>
  );
}

// 객관식 투표 컴포넌트
export function MultipleChoicePoll({ poll }: BasePollProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">객관식 투표</h2>
      <p className="text-gray-600">여러 옵션 중에서 선택하세요.</p>
      {/* TODO: 객관식 투표 컴포넌트 구현 */}
    </div>
  );
}
