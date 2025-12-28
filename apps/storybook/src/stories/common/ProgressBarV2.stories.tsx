import { ProgressBarV2 } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import * as React from "react";

const meta: Meta<typeof ProgressBarV2> = {
  title: "Common/ProgressBarV2",
  component: ProgressBarV2,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# ProgressBarV2

진행률을 시각적으로 표시하는 개선된 프로그레스 바 컴포넌트입니다.

## 특징

- ✅ 0%, 25%, 50%, 75%, 100% 구간에 tic(눈금) 표시
- ✅ 진행률에 따라 지나온 tic의 모양이 변경됨
- ✅ tic들 사이는 5개의 dash 선으로 연결됨
- ✅ 진행 퍼센트만큼 dash 선의 색이 연속적으로 채워짐

## 사용법

\`\`\`tsx
import { ProgressBarV2 } from "@repo/ui/components";

<ProgressBarV2 value={50} />
<ProgressBarV2 value={75} className="w-80" />
<ProgressBarV2 
  value={80} 
  activeColor="bg-blue-500"
  inactiveColor="bg-gray-200"
  ticActiveColor="bg-blue-500"
  ticInactiveColor="bg-gray-300"
/>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`number\` | - | 진행률 (0-100) |
| \`className\` | \`string\` | - | 컨테이너의 CSS 클래스 |
| \`activeColor\` | \`string\` | \`"bg-icon-default"\` | 활성화된 dash 선의 색상 |
| \`inactiveColor\` | \`string\` | \`"bg-light"\` | 비활성화된 dash 선의 색상 |
| \`ticActiveColor\` | \`string\` | \`"bg-icon-default"\` | 활성화된 tic의 색상 |
| \`ticInactiveColor\` | \`string\` | \`"bg-light"\` | 비활성화된 tic의 색상 |

## 예시

\`\`\`tsx
// 기본 사용
<ProgressBarV2 value={50} />

// 커스텀 색상
<ProgressBarV2 
  value={75} 
  activeColor="bg-blue-500"
  inactiveColor="bg-gray-200"
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
    className: {
      control: { type: "text" },
      description: "컨테이너의 CSS 클래스",
    },
    activeColor: {
      control: { type: "text" },
      description: "활성화된 dash 선의 색상",
    },
    inactiveColor: {
      control: { type: "text" },
      description: "비활성화된 dash 선의 색상",
    },
    ticActiveColor: {
      control: { type: "text" },
      description: "활성화된 tic의 색상",
    },
    ticInactiveColor: {
      control: { type: "text" },
      description: "비활성화된 tic의 색상",
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
      <ProgressBarV2 {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">0% - 시작</h3>
        <div className="w-80">
          <ProgressBarV2 value={0} />
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium">25% - 1/4 진행</h3>
        <div className="w-80">
          <ProgressBarV2 value={25} />
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium">50% - 절반 진행</h3>
        <div className="w-80">
          <ProgressBarV2 value={50} />
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium">75% - 3/4 진행</h3>
        <div className="w-80">
          <ProgressBarV2 value={75} />
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium">100% - 완료</h3>
        <div className="w-80">
          <ProgressBarV2 value={100} />
        </div>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">중간 진행률</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-gray-600">10%</p>
            <div className="w-80">
              <ProgressBarV2 value={10} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">35%</p>
            <div className="w-80">
              <ProgressBarV2 value={35} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">60%</p>
            <div className="w-80">
              <ProgressBarV2 value={60} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">85%</p>
            <div className="w-80">
              <ProgressBarV2 value={85} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
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
          <ProgressBarV2 value={progress} />
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
