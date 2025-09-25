import type { Meta, StoryObj } from "@storybook/nextjs";
import { PollOptionProgressive } from "@web/components/poll/PollOptionProgressive";
import { Heart, ThumbsUp, Star, Coffee } from "lucide-react";
import * as React from "react";

const meta: Meta<typeof PollOptionProgressive> = {
  title: "Pollia/PollOptionProgressive",
  component: PollOptionProgressive,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# PollOptionProgressive

투표 결과를 진행률과 함께 보여주는 컴포넌트입니다. 선택 상태와 진행률에 따라 시각적 피드백을 제공합니다.

## 사용법

\`\`\`tsx
import { PollOptionProgressive } from "@repo/ui/components";
import { Heart } from "lucide-react";

// 기본 사용법
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

// 아이콘 + 이미지 조합
<PollOptionProgressive
  icon={Heart}
  label="최고의 선택"
  percentage={90}
  selected={true}
  imageUrl="https://example.com/thumbnail.jpg"
/>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`icon\` | \`LucideIcon\` | - | 옵션을 나타내는 아이콘 (선택적) |
| \`label\` | \`string\` | - | 옵션 라벨 (필수) |
| \`percentage\` | \`number\` | - | 진행률 (0-100) |
| \`selected\` | \`boolean\` | \`false\` | 선택 상태 |
| \`imageUrl\` | \`string\` | - | 옵션 이미지 URL (선택적) |
| \`className\` | \`string\` | - | 추가 CSS 클래스 |

## 상태

- **기본**: 회색 텍스트, 회색 진행률 바
- **선택**: 보라색 텍스트, 보라색 진행률 바, 체크마크 표시

## 애니메이션

- 진행률 바: 300ms ease-out transition
- 텍스트 색상: 200ms transition
- 체크마크: 200ms fade in/out

## 접근성

- \`role="progressbar"\` 지원
- \`aria-valuenow\`, \`aria-valuemax\` 설정
- 스크린 리더를 위한 적절한 라벨링`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    percentage: {
      control: { type: "range", min: 0, max: 100, step: 5 },
      description: "진행률 (0-100)",
    },
    selected: {
      control: { type: "boolean" },
      description: "선택 상태",
    },
    label: {
      control: { type: "text" },
      description: "옵션 라벨",
    },
    imageUrl: {
      control: { type: "text" },
      description: "옵션 이미지 URL (선택적)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 예시
export const Default: Story = {
  args: {
    label: "좋아요",
    percentage: 0,
    selected: false,
  },
};

// 아이콘 포함
export const WithIcon: Story = {
  args: {
    icon: Heart,
    label: "좋아요",
    percentage: 0,
    selected: false,
  },
};

// 선택된 상태
export const Selected: Story = {
  args: {
    icon: Heart,
    label: "좋아요",
    percentage: 0,
    selected: true,
  },
};

// 이미지 포함
export const WithImage: Story = {
  args: {
    icon: Heart,
    label: "좋아요",
    percentage: 75,
    selected: true,
    imageUrl:
      "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=48&h=48&fit=crop&crop=face",
  },
};

// 이미지만 (아이콘 없음)
export const ImageOnly: Story = {
  args: {
    label: "프로필 사진",
    percentage: 60,
    selected: false,
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face",
  },
};

// 다양한 진행률
export const ProgressStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <h3 className="mb-3 text-sm font-medium">Basic Progress States</h3>
        <div className="space-y-2">
          <PollOptionProgressive icon={Heart} label="좋아요" percentage={0} />
          <PollOptionProgressive
            icon={ThumbsUp}
            label="싫어요"
            percentage={25}
          />
          <PollOptionProgressive icon={Star} label="보통" percentage={50} />
          <PollOptionProgressive icon={Coffee} label="최고" percentage={75} />
          <PollOptionProgressive icon={Heart} label="완벽" percentage={100} />
        </div>
      </div>
    </div>
  ),
};

// 선택된 상태 다양한 진행률
export const SelectedStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <h3 className="mb-3 text-sm font-medium">Selected Progress States</h3>
        <div className="space-y-2">
          <PollOptionProgressive
            icon={Heart}
            label="좋아요"
            percentage={0}
            selected
          />
          <PollOptionProgressive
            icon={ThumbsUp}
            label="싫어요"
            percentage={25}
            selected
          />
          <PollOptionProgressive
            icon={Star}
            label="보통"
            percentage={50}
            selected
          />
          <PollOptionProgressive
            icon={Coffee}
            label="최고"
            percentage={75}
            selected
          />
          <PollOptionProgressive
            icon={Heart}
            label="완벽"
            percentage={100}
            selected
          />
        </div>
      </div>
    </div>
  ),
};

// 아이콘 없는 버전
export const WithoutIcon: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <h3 className="mb-3 text-sm font-medium">Without Icons</h3>
        <div className="space-y-2">
          <PollOptionProgressive label="옵션 A" percentage={30} />
          <PollOptionProgressive label="옵션 B" percentage={60} selected />
          <PollOptionProgressive label="옵션 C" percentage={10} />
        </div>
      </div>
    </div>
  ),
};

// 다양한 조합
export const MixedVariants: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <h3 className="mb-3 text-sm font-medium">Mixed Variants</h3>
        <div className="space-y-2">
          <PollOptionProgressive
            icon={Heart}
            label="아이콘만"
            percentage={25}
          />
          <PollOptionProgressive
            label="이미지만"
            percentage={35}
            selected
            imageUrl="https://images.unsplash.com/photo-1534361960057-19889db9621e?w=48&h=48&fit=crop&crop=face"
          />
          <PollOptionProgressive
            icon={Star}
            label="아이콘 + 이미지"
            percentage={20}
            imageUrl="https://images.unsplash.com/photo-1494790108755-2616b612b372?w=48&h=48&fit=crop&crop=face"
          />
          <PollOptionProgressive label="텍스트만" percentage={20} />
        </div>
      </div>
    </div>
  ),
};

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div>
        <h3 className="mb-3 text-sm font-medium">
          Binary Vote (좋아요/싫어요)
        </h3>
        <div className="space-y-2">
          <PollOptionProgressive
            icon={Heart}
            label="좋아요"
            percentage={75}
            selected
          />
          <PollOptionProgressive
            icon={ThumbsUp}
            label="싫어요"
            percentage={25}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Multiple Choice</h3>
        <div className="space-y-2">
          <PollOptionProgressive label="React" percentage={45} selected />
          <PollOptionProgressive label="Vue" percentage={30} />
          <PollOptionProgressive label="Angular" percentage={15} />
          <PollOptionProgressive label="기타" percentage={10} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">프로필 선택 (이미지 포함)</h3>
        <div className="space-y-2">
          <PollOptionProgressive
            label="김철수"
            percentage={40}
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
            percentage={25}
            imageUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
          />
        </div>
      </div>
    </div>
  ),
};

// 인터랙티브 예시
export const Interactive: Story = {
  render: () => {
    const [selectedOption, setSelectedOption] = React.useState<number | null>(
      null
    );
    const [votes, setVotes] = React.useState([45, 30, 15, 10]);

    const options = [
      { label: "React", icon: Star },
      { label: "Vue", icon: Heart },
      { label: "Angular", icon: ThumbsUp },
      { label: "기타", icon: Coffee },
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

    return (
      <div className="space-y-4 w-80">
        <div>
          <h3 className="mb-3 text-sm font-medium">Interactive Vote</h3>
          <p className="mb-4 text-sm text-gray-500">
            클릭해서 투표해보세요! (총 {total}표)
          </p>
          <div className="space-y-2">
            {options.map((option, index) => (
              <button
                key={option.label}
                onClick={() => handleVote(index)}
                className="w-full text-left"
              >
                <PollOptionProgressive
                  icon={option.icon}
                  label={option.label}
                  percentage={Math.round(
                    ((votes[index] || 0) / Math.max(total, 1)) * 100
                  )}
                  selected={selectedOption === index}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// 이미지 포함 인터랙티브 예시
export const InteractiveWithImages: Story = {
  render: () => {
    const [selectedCandidate, setSelectedCandidate] = React.useState<
      number | null
    >(null);
    const [votes, setVotes] = React.useState([120, 98, 85, 67]);

    const candidates = [
      {
        name: "김철수",
        imageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face",
      },
      {
        name: "이영희",
        imageUrl:
          "https://images.unsplash.com/photo-1494790108755-2616b612b372?w=48&h=48&fit=crop&crop=face",
      },
      {
        name: "박민수",
        imageUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face",
      },
      {
        name: "최지영",
        imageUrl:
          "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=48&h=48&fit=crop&crop=face",
      },
    ];

    const handleVote = (index: number) => {
      if (selectedCandidate === index) {
        setSelectedCandidate(null);
        return;
      }

      setSelectedCandidate(index);
      const newVotes = [...votes];
      if (newVotes[index] !== undefined) {
        newVotes[index] += 1;
        setVotes(newVotes);
      }
    };

    const total = votes.reduce((sum, vote) => sum + vote, 0);

    return (
      <div className="space-y-4 w-80">
        <div>
          <h3 className="mb-3 text-sm font-medium">
            후보자 투표 (이미지 포함)
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            좋아하는 후보자를 클릭해서 투표해보세요! (총 {total}표)
          </p>
          <div className="space-y-2">
            {candidates.map((candidate, index) => (
              <button
                key={candidate.name}
                onClick={() => handleVote(index)}
                className="w-full text-left transition-transform hover:scale-[1.02]"
              >
                <PollOptionProgressive
                  label={candidate.name}
                  imageUrl={candidate.imageUrl}
                  percentage={Math.round(
                    ((votes[index] || 0) / Math.max(total, 1)) * 100
                  )}
                  selected={selectedCandidate === index}
                />
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-sm">
            <p className="text-xs text-gray-600">
              💡 Tip: 같은 후보자를 다시 클릭하면 선택 해제됩니다
            </p>
          </div>
        </div>
      </div>
    );
  },
};

// 아이콘 + 이미지 조합 인터랙티브
export const InteractiveIconsAndImages: Story = {
  render: () => {
    const [selectedChoice, setSelectedChoice] = React.useState<number | null>(
      null
    );
    const [votes, setVotes] = React.useState([78, 65, 43, 29]);

    const choices = [
      {
        label: "최고의 커피",
        icon: Coffee,
        imageUrl:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=48&h=48&fit=crop&crop=center",
      },
      {
        label: "인기 디저트",
        icon: Heart,
        imageUrl:
          "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=48&h=48&fit=crop&crop=center",
      },
      {
        label: "추천 음료",
        icon: Star,
        imageUrl:
          "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=48&h=48&fit=crop&crop=center",
      },
      {
        label: "특별 메뉴",
        icon: ThumbsUp,
        imageUrl:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=48&h=48&fit=crop&crop=center",
      },
    ];

    const handleVote = (index: number) => {
      if (selectedChoice === index) {
        setSelectedChoice(null);
        return;
      }

      setSelectedChoice(index);
      const newVotes = [...votes];
      if (newVotes[index] !== undefined) {
        newVotes[index] += 1;
        setVotes(newVotes);
      }
    };

    const total = votes.reduce((sum, vote) => sum + vote, 0);
    const winner = votes.indexOf(Math.max(...votes));

    return (
      <div className="space-y-4 w-80">
        <div>
          <h3 className="mb-3 text-sm font-medium">
            카페 메뉴 선호도 (아이콘 + 이미지)
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            가장 좋아하는 메뉴를 선택해주세요! (총 {total}표)
          </p>
          <div className="space-y-2">
            {choices.map((choice, index) => (
              <button
                key={choice.label}
                onClick={() => handleVote(index)}
                className={`w-full text-left transition-all duration-200 ${
                  selectedChoice === index
                    ? "transform scale-[1.02] shadow-sm"
                    : "hover:scale-[1.01]"
                }`}
              >
                <PollOptionProgressive
                  icon={choice.icon}
                  label={choice.label}
                  imageUrl={choice.imageUrl}
                  percentage={Math.round(
                    ((votes[index] || 0) / Math.max(total, 1)) * 100
                  )}
                  selected={selectedChoice === index}
                />
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="p-3 bg-violet-50 rounded-sm border border-violet-100">
              <p className="text-sm text-violet-700">
                🏆 현재 1위: <strong>{choices[winner]?.label}</strong> (
                {Math.round(((votes[winner] || 0) / total) * 100)}%)
              </p>
            </div>
            <div className="p-2 bg-gray-50 rounded-sm">
              <p className="text-xs text-gray-600">
                ✨ 아이콘과 이미지가 함께 있는 풍부한 시각적 투표 경험
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
