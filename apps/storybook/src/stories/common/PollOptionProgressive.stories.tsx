import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { PollOptionProgressive } from "@web/components/poll/PollOptionProgressive";
import { Calendar, Coffee, Heart, Star, ThumbsUp, Trophy, Users } from "lucide-react";

const meta: Meta<typeof PollOptionProgressive> = {
  title: "Pollia/PollOptionProgressive",
  component: PollOptionProgressive,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# PollOptionProgressive

투표 결과를 진행률과 함께 보여주는 고급 컴포넌트입니다. 투표 진행 모드와 결과 표시 모드를 모두 지원하며, 아이콘과 이미지를 함께 사용할 수 있습니다.

## 주요 기능

- **이중 모드**: 투표 진행(percentage 없음) / 결과 표시(percentage 있음)
- **부드러운 애니메이션**: 선택 상태 변화 시 체크마크와 퍼센테이지 이동
- **멀티미디어 지원**: 아이콘과 이미지 동시 사용 가능
- **접근성**: ARIA 속성과 적절한 role 지원
- **반응형**: 다양한 컨테이너 크기에 적응

## 사용법

\`\`\`tsx
import { PollOptionProgressive } from "@repo/ui/components";
import { Heart } from "lucide-react";

// 기본 사용법 (투표 진행 모드)
<PollOptionProgressive
  icon={Heart}
  label="좋아요"
  selected={true}
/>

// 결과 표시 모드
<PollOptionProgressive
  icon={Heart}
  label="좋아요"
  percentage={75}
  selected={true}
/>

// 이미지 포함
<PollOptionProgressive
  label="김철수"
  percentage={60}
  selected={false}
  imageUrl="https://example.com/profile.jpg"
/>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`icon\` | \`LucideIcon\` | - | 옵션을 나타내는 아이콘 (선택적) |
| \`label\` | \`string\` | - | 옵션 라벨 (필수) |
| \`percentage\` | \`number\` | - | 진행률 (0-100, 선택적) |
| \`selected\` | \`boolean\` | \`false\` | 선택 상태 |
| \`imageUrl\` | \`string\` | - | 옵션 이미지 URL (선택적) |
| \`className\` | \`string\` | - | 추가 CSS 클래스 |

## 모드별 동작

### 투표 진행 모드 (percentage 없음)
- 퍼센테이지 텍스트 숨김
- 체크마크가 오른쪽 끝에 위치
- 선택 상태만 시각적으로 표시

### 결과 표시 모드 (percentage 있음)
- 퍼센테이지 텍스트 표시
- 선택 시 퍼센테이지가 체크마크 공간만큼 이동
- Progress bar로 진행률 시각화

## 접근성

- \`role="progressbar"\` 지원
- \`aria-valuenow\`, \`aria-valuemax\` 설정
- 스크린 리더를 위한 적절한 라벨링
- 키보드 네비게이션 지원`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: false,
      description: "Lucide 아이콘 컴포넌트",
    },
    label: {
      control: { type: "text" },
      description: "옵션 라벨 (필수)",
    },
    percentage: {
      control: { type: "range", min: 0, max: 100, step: 5 },
      description: "진행률 (0-100, 선택적)",
    },
    selected: {
      control: { type: "boolean" },
      description: "선택 상태",
    },
    imageUrl: {
      control: { type: "text" },
      description: "옵션 이미지 URL (선택적)",
    },
    className: {
      control: { type: "text" },
      description: "추가 CSS 클래스",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// 기본 예시들
// ============================================================================

export const Default: Story = {
  args: {
    label: "기본 옵션",
    percentage: 45,
    selected: false,
  },
};

export const WithIcon: Story = {
  args: {
    icon: Heart,
    label: "좋아요",
    percentage: 75,
    selected: false,
  },
};

export const Selected: Story = {
  args: {
    icon: Heart,
    label: "좋아요",
    percentage: 75,
    selected: true,
  },
};

export const WithImage: Story = {
  args: {
    label: "프로필 옵션",
    percentage: 60,
    selected: false,
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face",
  },
};

export const IconAndImage: Story = {
  args: {
    icon: Trophy,
    label: "최고의 선택",
    percentage: 90,
    selected: true,
    imageUrl:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=48&h=48&fit=crop&crop=center",
  },
};

// ============================================================================
// 모드별 예시들
// ============================================================================

export const VotingMode: Story = {
  args: {
    icon: Heart,
    label: "투표 진행 중",
    selected: true,
    // percentage 없음 - 투표 모드
  },
  parameters: {
    docs: {
      description: {
        story:
          "투표 진행 중일 때 사용하는 모드입니다. percentage를 생략하면 퍼센테이지가 표시되지 않습니다.",
      },
    },
  },
};

export const ResultMode: Story = {
  args: {
    icon: Heart,
    label: "결과 표시",
    percentage: 85,
    selected: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "투표 결과를 표시할 때 사용하는 모드입니다. percentage를 포함하면 진행률이 시각화됩니다.",
      },
    },
  },
};

// ============================================================================
// 진행률 상태들
// ============================================================================

export const ProgressStates: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">다양한 진행률</h3>
        <div className="space-y-2">
          <PollOptionProgressive icon={Heart} label="0%" percentage={0} />
          <PollOptionProgressive icon={Star} label="25%" percentage={25} />
          <PollOptionProgressive icon={ThumbsUp} label="50%" percentage={50} selected />
          <PollOptionProgressive icon={Coffee} label="75%" percentage={75} />
          <PollOptionProgressive icon={Trophy} label="100%" percentage={100} />
        </div>
      </div>
    </div>
  ),
};

export const SelectionStates: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">선택 상태별 비교</h3>
        <div className="space-y-2">
          <PollOptionProgressive
            icon={Heart}
            label="선택되지 않음"
            percentage={60}
            selected={false}
          />
          <PollOptionProgressive icon={Heart} label="선택됨" percentage={60} selected={true} />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          선택 상태에 따른 색상 변화와 체크마크 애니메이션을 확인하세요.
        </p>
      </div>
    </div>
  ),
};

// ============================================================================
// 모드 비교
// ============================================================================

export const ModeComparison: Story = {
  render: () => (
    <div className="w-96 space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-blue-700">🗳️ 투표 진행 모드</h3>
        <div className="space-y-2">
          <PollOptionProgressive icon={Heart} label="좋아요" selected={false} />
          <PollOptionProgressive icon={Heart} label="좋아요" selected={true} />
          <PollOptionProgressive icon={ThumbsUp} label="싫어요" selected={false} />
        </div>
        <p className="mt-2 text-xs text-blue-600">퍼센테이지 없음 - 투표 진행 중일 때 사용</p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-green-700">📊 결과 표시 모드</h3>
        <div className="space-y-2">
          <PollOptionProgressive icon={Heart} label="좋아요" percentage={70} selected={false} />
          <PollOptionProgressive icon={Heart} label="좋아요" percentage={70} selected={true} />
          <PollOptionProgressive icon={ThumbsUp} label="싫어요" percentage={30} selected={false} />
        </div>
        <p className="mt-2 text-xs text-green-600">퍼센테이지 표시 - 투표 결과를 보여줄 때 사용</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "투표 진행 모드와 결과 표시 모드의 차이점을 직접 비교할 수 있습니다.",
      },
    },
  },
};

// ============================================================================
// 멀티미디어 예시들
// ============================================================================

export const MediaVariations: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">멀티미디어 조합</h3>
        <div className="space-y-2">
          <PollOptionProgressive icon={Heart} label="아이콘만" percentage={35} />
          <PollOptionProgressive
            label="이미지만"
            percentage={25}
            imageUrl="https://images.unsplash.com/photo-1534361960057-19889db9621e?w=48&h=48&fit=crop&crop=face"
          />
          <PollOptionProgressive
            icon={Star}
            label="아이콘 + 이미지"
            percentage={40}
            selected
            imageUrl="https://images.unsplash.com/photo-1494790108755-2616b612b372?w=48&h=48&fit=crop&crop=face"
          />
          <PollOptionProgressive label="텍스트만" percentage={20} />
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// 실제 사용 시나리오들
// ============================================================================

export const RealWorldScenarios: Story = {
  render: () => (
    <div className="w-96 space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">감정 투표</h3>
        <div className="space-y-2">
          <PollOptionProgressive icon={Heart} label="좋아요" percentage={65} selected />
          <PollOptionProgressive icon={ThumbsUp} label="괜찮아요" percentage={25} />
          <PollOptionProgressive icon={Star} label="보통이에요" percentage={10} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">후보자 선택</h3>
        <div className="space-y-2">
          <PollOptionProgressive
            label="김철수"
            percentage={45}
            selected
            imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"
          />
          <PollOptionProgressive
            label="이영희"
            percentage={35}
            imageUrl="https://images.unsplash.com/photo-1494790108755-2616b612b372?w=48&h=48&fit=crop&crop=face"
          />
          <PollOptionProgressive
            label="박민수"
            percentage={20}
            imageUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">활동 선호도</h3>
        <div className="space-y-2">
          <PollOptionProgressive
            icon={Coffee}
            label="카페 방문"
            percentage={40}
            imageUrl="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=48&h=48&fit=crop&crop=center"
          />
          <PollOptionProgressive
            icon={Users}
            label="친구 만나기"
            percentage={35}
            selected
            imageUrl="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=48&h=48&fit=crop&crop=center"
          />
          <PollOptionProgressive
            icon={Calendar}
            label="집에서 휴식"
            percentage={25}
            imageUrl="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=48&h=48&fit=crop&crop=center"
          />
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// 인터랙티브 예시들
// ============================================================================

export const InteractiveToggle: Story = {
  render: () => {
    const [showResults, setShowResults] = React.useState(false);
    const [selectedOption, setSelectedOption] = React.useState<number | null>(1);

    const options = [
      { label: "React", icon: Star, percentage: 45 },
      { label: "Vue", icon: Heart, percentage: 30 },
      { label: "Angular", icon: ThumbsUp, percentage: 15 },
      { label: "Svelte", icon: Coffee, percentage: 10 },
    ];

    return (
      <div className="w-96 space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <span className="text-sm font-medium">{showResults ? "📊 결과 보기" : "🗳️ 투표 중"}</span>
          <button
            onClick={() => setShowResults(!showResults)}
            className="rounded-md bg-violet-600 px-3 py-1 text-xs text-white transition-colors hover:bg-violet-700"
          >
            {showResults ? "투표 모드" : "결과 보기"}
          </button>
        </div>

        <div className="space-y-2">
          {options.map((option, index) => (
            <button
              key={option.label}
              onClick={() => setSelectedOption(selectedOption === index ? null : index)}
              className="w-full text-left"
            >
              <PollOptionProgressive
                icon={option.icon}
                label={option.label}
                percentage={showResults ? option.percentage : undefined}
                selected={selectedOption === index}
              />
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-sm font-medium text-blue-800">
            현재 모드: {showResults ? "결과 표시" : "투표 진행"}
          </p>
          <p className="mt-1 text-xs text-blue-600">
            {showResults
              ? "퍼센테이지가 표시되고 선택 시 애니메이션이 적용됩니다."
              : "퍼센테이지가 숨겨지고 선택 상태만 표시됩니다."}
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "실시간으로 투표 모드와 결과 모드를 전환하며 차이점을 체험할 수 있습니다.",
      },
    },
  },
};

export const VotingSimulation: Story = {
  render: () => {
    const [votes, setVotes] = React.useState([45, 30, 15, 10]);
    const [selectedOption, setSelectedOption] = React.useState<number | null>(null);

    const options = [
      {
        label: "최고의 피자 토핑",
        icon: Heart,
        imageUrl:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=48&h=48&fit=crop&crop=center",
      },
      {
        label: "치킨",
        icon: Star,
        imageUrl:
          "https://images.unsplash.com/photo-1562967914-608f82629710?w=48&h=48&fit=crop&crop=center",
      },
      {
        label: "햄버거",
        icon: ThumbsUp,
        imageUrl:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=48&h=48&fit=crop&crop=center",
      },
      {
        label: "초밥",
        icon: Coffee,
        imageUrl:
          "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=48&h=48&fit=crop&crop=center",
      },
    ];

    const handleVote = (index: number) => {
      if (selectedOption === index) {
        setSelectedOption(null);
        return;
      }

      setSelectedOption(index);
      const newVotes = [...votes];
      if (newVotes[index] !== undefined) {
        newVotes[index] += 1;
        setVotes(newVotes);
      }
    };

    const total = votes.reduce((sum, vote) => sum + vote, 0);
    const winner = votes.indexOf(Math.max(...votes));

    return (
      <div className="w-96 space-y-4">
        <div className="rounded-lg bg-violet-50 p-3 text-center">
          <h3 className="text-sm font-medium text-violet-900">🍕 좋아하는 음식 투표</h3>
          <p className="text-xs text-violet-600">
            총 {total}표 참여 · 1위: {winner !== -1 ? options[winner]?.label : "없음"}
          </p>
        </div>

        <div className="space-y-2">
          {options.map((option, index) => (
            <button
              key={option.label}
              onClick={() => handleVote(index)}
              className="w-full text-left transition-transform hover:scale-[1.01]"
            >
              <PollOptionProgressive
                icon={option.icon}
                label={option.label}
                imageUrl={option.imageUrl}
                percentage={Math.round(((votes[index] || 0) / Math.max(total, 1)) * 100)}
                selected={selectedOption === index}
              />
            </button>
          ))}
        </div>

        <div className="text-center text-xs text-gray-500">
          💡 항목을 클릭해서 투표해보세요! 실시간으로 결과가 반영됩니다.
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "실제 투표 시스템처럼 작동하는 시뮬레이션입니다. 클릭하면 투표가 반영되고 실시간으로 결과를 확인할 수 있습니다.",
      },
    },
  },
};

// ============================================================================
// 접근성 예시
// ============================================================================

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">접근성 기능</h3>
        <div className="space-y-2">
          <PollOptionProgressive
            icon={Heart}
            label="키보드 네비게이션 지원"
            percentage={85}
            selected
          />
          <PollOptionProgressive icon={Users} label="스크린 리더 최적화" percentage={70} />
          <PollOptionProgressive icon={Star} label="ARIA 속성 완벽 지원" percentage={90} />
        </div>
        <div className="mt-3 rounded-lg bg-green-50 p-3">
          <p className="text-xs text-green-700">
            ✅ role=&quot;progressbar&quot; 지원
            <br />
            ✅ aria-valuenow, aria-valuemax 설정
            <br />
            ✅ 적절한 aria-label 제공
            <br />✅ 키보드 포커스 시각화
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "웹 접근성 가이드라인(WCAG)을 준수하는 접근성 기능들을 확인할 수 있습니다.",
      },
    },
  },
};
