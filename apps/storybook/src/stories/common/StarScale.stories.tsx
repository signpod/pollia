import { StarScale, type StarScaleProps } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

const meta: Meta<StarScaleProps> = {
  title: "Common/StarScale",
  component: StarScale,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# StarScale

별점 평가를 위한 슬라이더 컴포넌트입니다. 0.5 단위로 0.5부터 5까지 선택할 수 있으며, 드래그하여 값을 변경할 수 있습니다.

## 주요 기능

- 0.5 단위 선택 (0.5, 1.0, 1.5, ..., 5.0)
- 5개 별 표시
- 반쪽 별 표시 지원
- 최대값(5.0)일 때 웃는 얼굴 별 표시
- 터치/드래그 인터랙션 지원
- 제어 가능한 컴포넌트 (value, onChange props 지원)
- 비제어 모드 지원 (props 없이 사용 시 내부 상태 관리)

## 사용법

\`\`\`tsx
import { StarScale } from "@repo/ui/components";
import { useState } from "react";

// 비제어 모드 (내부 상태 관리)
function UncontrolledExample() {
  return <StarScale />;
}

// 제어 모드 (외부 상태 관리)
function ControlledExample() {
  const [value, setValue] = useState(3);
  
  return (
    <StarScale 
      value={value} 
      onChange={setValue}
    />
  );
}
\`\`\`

## 동작 방식

- 슬라이더를 드래그하거나 클릭하여 별점을 선택합니다
- 0.5 단위로 값이 변경됩니다
- 선택된 값 이상의 별은 노란색으로 표시됩니다
- 선택된 값보다 0.5 작은 별은 반쪽 별로 표시됩니다
- 최대값(5.0)일 때는 웃는 얼굴 별이 표시됩니다
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex min-h-[200px] w-[600px] flex-col items-center justify-center gap-4 p-8">
      <StarScale />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "기본 별점 슬라이더입니다. 드래그하여 값을 변경할 수 있습니다.",
      },
    },
  },
};

export const States: Story = {
  render: () => {
    const values = [0.5, 1.0, 2.5, 3.5, 5.0];

    return (
      <div className="flex min-h-[400px] w-[600px] flex-col gap-8 p-8">
        <h3 className="text-base font-medium">다양한 별점 상태</h3>
        {values.map(value => (
          <div key={value} className="flex flex-col gap-2">
            <p className="text-sm text-zinc-600">별점: {value}</p>
            <StarScale value={value} />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "다양한 별점 값의 상태를 보여줍니다. 0.5 단위로 선택할 수 있으며, 반쪽 별과 전체 별이 자동으로 표시됩니다.",
      },
    },
  },
};

export const HalfStar: Story = {
  render: () => (
    <div className="flex min-h-[200px] w-[800px] flex-col items-center justify-center gap-4 p-8">
      <div className="flex w-full flex-col gap-4">
        <p className="text-sm text-zinc-600">반쪽 별 예시 (2.5점)</p>
        <StarScale value={2.5} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "반쪽 별이 표시되는 예시입니다. 값이 정수가 아닌 경우 (예: 2.5) 마지막 별이 반쪽으로 표시됩니다.",
      },
    },
  },
};

export const MaxValue: Story = {
  render: () => (
    <div className="flex min-h-[200px] w-[800px] flex-col items-center justify-center gap-4 p-8">
      <div className="flex w-full flex-col gap-4">
        <p className="text-sm text-zinc-600">최대값 예시 (5.0점 - 웃는 얼굴 별)</p>
        <StarScale value={5.0} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "최대값(5.0)일 때는 웃는 얼굴 별이 표시됩니다. 이는 최고 평가를 시각적으로 강조합니다.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(1.0);

    return (
      <div className="flex min-h-[300px] w-[800px] flex-col items-center justify-center gap-6 p-8">
        <div className="flex w-full flex-col gap-4">
          <h3 className="text-base font-medium">인터랙티브 예시</h3>
          <p className="text-sm text-zinc-600">현재 선택된 별점: {value}</p>
          <StarScale value={value} onChange={setValue} />
          <div className="mt-4 rounded-lg bg-zinc-100 p-4">
            <h4 className="mb-2 font-semibold">선택된 값:</h4>
            <pre className="text-sm">{JSON.stringify({ value }, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "인터랙티브한 별점 선택 예시입니다. 슬라이더를 드래그하여 값을 변경하고, 변경된 값을 확인할 수 있습니다.",
      },
    },
  },
};
