interface BasePollProps {
  poll: any;
}

interface BasePollComponentProps {
  poll: any;
  title: string;
  description: string;
  children: React.ReactNode;
}

function BasePollComponent({
  poll,
  title,
  description,
  children,
}: BasePollComponentProps) {
  // TODO: 공통 로직 구현 (상태 관리, 투표 처리 등)
  const pollId = poll?.id;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      {children}
      {/* 디버그용 - 나중에 제거 */}
      {pollId && <div className="hidden">{pollId}</div>}
    </div>
  );
}

export function YesNoPoll({ poll }: BasePollProps) {
  return (
    <BasePollComponent
      poll={poll}
      title="O/X 투표"
      description="예/아니오로 투표하세요."
    >
      {/* TODO: O/X 투표 UI 구현 */}
      <div className="text-sm text-gray-500">O/X 투표 컴포넌트 구현 예정</div>
    </BasePollComponent>
  );
}

export function LikeDislikePoll({ poll }: BasePollProps) {
  return (
    <BasePollComponent
      poll={poll}
      title="호불호 투표"
      description="좋아요/싫어요로 투표하세요."
    >
      {/* TODO: 호불호 투표 UI 구현 */}
      <div className="text-sm text-gray-500">
        호불호 투표 컴포넌트 구현 예정
      </div>
    </BasePollComponent>
  );
}

export function MultipleChoicePoll({ poll }: BasePollProps) {
  return (
    <BasePollComponent
      poll={poll}
      title="객관식 투표"
      description="여러 옵션 중에서 선택하세요."
    >
      {/* TODO: 객관식 투표 UI 구현 */}
      <div className="text-sm text-gray-500">
        객관식 투표 컴포넌트 구현 예정
      </div>
    </BasePollComponent>
  );
}
