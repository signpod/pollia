import { ProgressBar } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import * as React from "react";

const meta: Meta<typeof ProgressBar> = {
  title: "Common/ProgressBar",
  component: ProgressBar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# ProgressBar

진행률을 시각적으로 표시하는 프로그레스 바 컴포넌트입니다.

## 사용법

\`\`\`tsx
import { ProgressBar } from "@repo/ui/components";

<ProgressBar value={50} />
<ProgressBar value={75} containerClassName="w-80" />
<ProgressBar value={80} containerClassName="bg-gray-200" indicatorClassName="bg-blue-500" />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`number\` | \`0\` | 진행률 (0-100) |
| \`containerClassName\` | \`string\` | - | 배경 컨테이너의 CSS 클래스 |
| \`indicatorClassName\` | \`string\` | - | 진행 표시 인디케이터의 CSS 클래스 |

## 특징

- ✅ 0-100 범위의 진행률 표시
- ✅ 부드러운 애니메이션 전환
- ✅ 배경과 인디케이터 개별 스타일 커스터마이징
- ✅ Radix UI 기반의 접근성
- ✅ TypeScript 타입 안전성

## 예시

\`\`\`tsx
// 설문 진행률 표시
const currentQuestion = 3;
const totalQuestions = 10;
const progress = (currentQuestion / totalQuestions) * 100;
<ProgressBar value={progress} containerClassName="w-full" />

// 파일 업로드 진행률
const [uploadProgress, setUploadProgress] = useState(0);
<ProgressBar value={uploadProgress} />

// 커스텀 스타일 - 배경과 인디케이터 색상 변경
<ProgressBar 
  value={80} 
  containerClassName="h-4 rounded-full bg-gray-200"
  indicatorClassName="bg-blue-500"
/>
\`\`\``,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "진행률 (0-100)",
    },
    containerClassName: {
      control: { type: "text" },
      description: "배경 컨테이너의 CSS 클래스",
    },
    indicatorClassName: {
      control: { type: "text" },
      description: "진행 표시 인디케이터의 CSS 클래스",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
  render: args => (
    <div className="w-80">
      <ProgressBar {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    value: 0,
  },
  render: args => (
    <div className="w-80">
      <ProgressBar {...args} />
    </div>
  ),
};

export const Quarter: Story = {
  args: {
    value: 25,
  },
  render: args => (
    <div className="w-80">
      <ProgressBar {...args} />
    </div>
  ),
};

export const Half: Story = {
  args: {
    value: 50,
  },
  render: args => (
    <div className="w-80">
      <ProgressBar {...args} />
    </div>
  ),
};

export const ThreeQuarters: Story = {
  args: {
    value: 75,
  },
  render: args => (
    <div className="w-80">
      <ProgressBar {...args} />
    </div>
  ),
};

export const Full: Story = {
  args: {
    value: 100,
  },
  render: args => (
    <div className="w-80">
      <ProgressBar {...args} />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => {
    return (
      <div
        style={{
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div>
          <p className="mb-2 text-sm text-gray-600">0% - 시작</p>
          <ProgressBar value={0} containerClassName="w-80" />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">25% - 1/4 진행</p>
          <ProgressBar value={25} containerClassName="w-80" />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">50% - 절반 진행</p>
          <ProgressBar value={50} containerClassName="w-80" />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">75% - 3/4 진행</p>
          <ProgressBar value={75} containerClassName="w-80" />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">100% - 완료</p>
          <ProgressBar value={100} containerClassName="w-80" />
        </div>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0);

    const increase = () => {
      setProgress(prev => Math.min(prev + 10, 100));
    };

    const decrease = () => {
      setProgress(prev => Math.max(prev - 10, 0));
    };

    const reset = () => {
      setProgress(0);
    };

    return (
      <div style={{ padding: "40px" }}>
        <div className="mb-4 w-80">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">진행률</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <ProgressBar value={progress} containerClassName="w-full" />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={decrease}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300"
          >
            -10%
          </button>
          <button
            type="button"
            onClick={increase}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300"
          >
            +10%
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300"
          >
            초기화
          </button>
        </div>
      </div>
    );
  },
};

export const WithCustomStyles: Story = {
  render: () => {
    return (
      <div
        style={{
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div>
          <p className="mb-2 text-sm text-gray-600">기본 크기 (h-2)</p>
          <ProgressBar value={60} containerClassName="w-80" />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">중간 크기 (h-3)</p>
          <ProgressBar value={60} containerClassName="h-3 w-80" />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">큰 크기 (h-4)</p>
          <ProgressBar value={60} containerClassName="h-4 w-80" />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">둥근 모서리 (rounded-full)</p>
          <ProgressBar value={60} containerClassName="h-3 w-80 rounded-full" />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">다양한 너비</p>
          <div className="space-y-2">
            <ProgressBar value={60} containerClassName="w-40" />
            <ProgressBar value={60} containerClassName="w-60" />
            <ProgressBar value={60} containerClassName="w-80" />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">커스텀 배경 색상</p>
          <div className="space-y-2">
            <ProgressBar
              value={60}
              containerClassName="w-80 bg-gray-200"
              indicatorClassName="bg-blue-500"
            />
            <ProgressBar
              value={60}
              containerClassName="w-80 bg-purple-100"
              indicatorClassName="bg-purple-600"
            />
            <ProgressBar
              value={60}
              containerClassName="w-80 bg-green-100"
              indicatorClassName="bg-green-600"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">인디케이터 스타일 커스터마이징</p>
          <div className="space-y-2">
            <ProgressBar
              value={60}
              containerClassName="w-80 h-3"
              indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-600"
            />
            <ProgressBar
              value={60}
              containerClassName="w-80 h-3 rounded-full"
              indicatorClassName="bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"
            />
            <ProgressBar
              value={60}
              containerClassName="w-80 h-4 bg-zinc-200"
              indicatorClassName="bg-zinc-800"
            />
          </div>
        </div>
      </div>
    );
  },
};

export const InContext: Story = {
  render: () => {
    return (
      <div style={{ padding: "40px", maxWidth: "400px" }}>
        <div className="space-y-6">
          {/* 설문 진행률 */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">설문 진행 중</h3>
              <span className="text-xs text-gray-600">3/10</span>
            </div>
            <ProgressBar value={30} />
            <p className="mt-2 text-xs text-gray-500">7개의 질문이 남았습니다</p>
          </div>

          {/* 파일 업로드 */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">파일 업로드 중</h3>
              <span className="text-xs text-gray-600">78%</span>
            </div>
            <ProgressBar value={78} />
            <p className="mt-2 text-xs text-gray-500">document.pdf (2.4 MB)</p>
          </div>

          {/* 프로필 완성도 */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">프로필 완성도</h3>
              <span className="text-xs text-gray-600">90%</span>
            </div>
            <ProgressBar value={90} />
            <p className="mt-2 text-xs text-gray-500">프로필 사진만 추가하면 완료!</p>
          </div>
        </div>
      </div>
    );
  },
};

export const AnimationDemo: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 1;
        });
      }, 50);

      return () => clearInterval(timer);
    }, []);

    return (
      <div style={{ padding: "40px" }}>
        <div className="w-80">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">자동 진행 애니메이션</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <ProgressBar value={progress} containerClassName="w-full" />
          <p className="mt-2 text-xs text-gray-500">
            진행률이 자동으로 증가하며, 100%에 도달하면 다시 시작됩니다.
          </p>
        </div>
      </div>
    );
  },
};
