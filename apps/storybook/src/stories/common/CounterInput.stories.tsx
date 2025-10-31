import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { CounterInput } from "@repo/ui/components";

const meta: Meta<typeof CounterInput> = {
  title: "Common/CounterInput",
  component: CounterInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# CounterInput

숫자 값을 증가/감소시킬 수 있는 카운터 입력 컴포넌트입니다. IconButton을 사용하여 구현되었습니다.

## 사용법

\`\`\`tsx
const [count, setCount] = useState(1);

<CounterInput
  value={count}
  onChange={setCount}
  min={1}
  max={10}
/>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`number\` | - | 현재 값 (필수) |
| \`onChange\` | \`(value: number) => void\` | - | 값 변경 핸들러 (필수) |
| \`min\` | \`number\` | \`0\` | 최솟값 |
| \`max\` | \`number\` | \`100\` | 최댓값 |
| \`step\` | \`number\` | \`1\` | 증감 단위 |
| \`disabled\` | \`boolean\` | \`false\` | 비활성화 상태 |
| \`className\` | \`string\` | - | 추가 CSS 클래스 |

## 기능

- IconButton 기반으로 구현된 일관된 버튼 스타일
- 최솟값에서 감소 버튼 자동 비활성화
- 최댓값에서 증가 버튼 자동 비활성화
- 키보드 접근성 지원 (Tab, Enter, Space)
- 호버 및 포커스 상태 표시`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "number" },
      description: "현재 값",
    },
    min: {
      control: { type: "number" },
      description: "최솟값",
    },
    max: {
      control: { type: "number" },
      description: "최댓값",
    },
    step: {
      control: { type: "number" },
      description: "증감 단위",
    },
    disabled: {
      control: { type: "boolean" },
      description: "비활성화 상태",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Controlled 컴포넌트 래퍼
function ControlledCounterInput(props: Partial<React.ComponentProps<typeof CounterInput>>) {
  const [value, setValue] = useState(props.value || 1);
  return <CounterInput {...props} value={value} onChange={setValue} />;
}

// 기본 CounterInput
export const Default: Story = {
  render: () => <ControlledCounterInput min={1} max={10} />,
};

// 다양한 범위와 설정
export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">기본 설정 (1-10)</h3>
        <ControlledCounterInput min={1} max={10} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">0부터 시작 (0-5)</h3>
        <ControlledCounterInput value={0} min={0} max={5} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">큰 범위 (1-100)</h3>
        <ControlledCounterInput value={50} min={1} max={100} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">단계별 증가 (0-100, step=10)</h3>
        <ControlledCounterInput value={20} min={0} max={100} step={10} />
      </div>
    </div>
  ),
};

// 경계값 테스트
export const BoundaryValues: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">최솟값 (1) - 감소 버튼 비활성화</h3>
        <ControlledCounterInput value={1} min={1} max={10} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">최댓값 (10) - 증가 버튼 비활성화</h3>
        <ControlledCounterInput value={10} min={1} max={10} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">단일 값 (5-5) - 양쪽 버튼 비활성화</h3>
        <ControlledCounterInput value={5} min={5} max={5} />
      </div>
    </div>
  ),
};

// 비활성화 상태
export const Disabled: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">전체 비활성화</h3>
        <ControlledCounterInput disabled />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">다양한 값에서 비활성화</h3>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="mb-2 text-xs text-gray-500">값: 1</p>
            <ControlledCounterInput value={1} disabled />
          </div>
          <div className="text-center">
            <p className="mb-2 text-xs text-gray-500">값: 5</p>
            <ControlledCounterInput value={5} disabled />
          </div>
          <div className="text-center">
            <p className="mb-2 text-xs text-gray-500">값: 10</p>
            <ControlledCounterInput value={10} disabled />
          </div>
        </div>
      </div>
    </div>
  ),
};

// 실제 사용 사례
export const RealWorldUseCases: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">선택 가능 답변 수 (폴리아)</h3>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <span className="font-medium">선택 가능 답변 수</span>
          <ControlledCounterInput value={1} min={1} max={10} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">수량 선택</h3>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <span className="font-medium">수량</span>
          <ControlledCounterInput value={1} min={1} max={99} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">페이지 수</h3>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <span className="font-medium">표시할 페이지 수</span>
          <ControlledCounterInput value={5} min={1} max={20} />
        </div>
      </div>
    </div>
  ),
};
