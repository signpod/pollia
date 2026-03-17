import { SegmentedControl } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

const meta: Meta<typeof SegmentedControl> = {
  title: "Common/SegmentedControl",
  component: SegmentedControl,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# SegmentedControl

iOS 스타일의 세그먼트 토글 컴포넌트입니다. 두 개 이상의 옵션 중 하나를 선택할 때 사용합니다.

## 사용법
\`\`\`tsx
<SegmentedControl
  items={[
    { value: "in-progress", label: "진행 중" },
    { value: "completed", label: "완료" },
  ]}
  value="in-progress"
  onValueChange={(value) => setValue(value)}
/>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "text" },
      description: "현재 선택된 값",
    },
    className: {
      control: { type: "text" },
      description: "추가 CSS 클래스",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    Story => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
  args: {
    items: [
      { value: "in-progress", label: "진행 중" },
      { value: "completed", label: "완료" },
    ],
    value: "in-progress",
    onValueChange: () => {},
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6 w-[350px]">
      <div>
        <h3 className="mb-3 text-sm font-medium">2개 옵션</h3>
        <SegmentedControl
          items={[
            { value: "in-progress", label: "진행 중" },
            { value: "completed", label: "완료" },
          ]}
          value="in-progress"
          onValueChange={() => {}}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">3개 옵션</h3>
        <SegmentedControl
          items={[
            { value: "all", label: "전체" },
            { value: "active", label: "활성" },
            { value: "inactive", label: "비활성" },
          ]}
          value="all"
          onValueChange={() => {}}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">두 번째 선택</h3>
        <SegmentedControl
          items={[
            { value: "in-progress", label: "진행 중" },
            { value: "completed", label: "완료" },
          ]}
          value="completed"
          onValueChange={() => {}}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "다양한 옵션 개수와 선택 상태를 보여줍니다.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = React.useState("in-progress");
    const [value3, setValue3] = React.useState("all");

    return (
      <div className="w-[350px] space-y-8">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">2개 옵션</h3>
          <div className="rounded-lg bg-violet-50 p-3">
            <p className="text-sm text-violet-700">
              현재 선택: <span className="font-semibold">{value}</span>
            </p>
          </div>
          <SegmentedControl
            items={[
              { value: "in-progress", label: "진행 중" },
              { value: "completed", label: "완료" },
            ]}
            value={value}
            onValueChange={setValue}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">3개 옵션</h3>
          <div className="rounded-lg bg-violet-50 p-3">
            <p className="text-sm text-violet-700">
              현재 선택: <span className="font-semibold">{value3}</span>
            </p>
          </div>
          <SegmentedControl
            items={[
              { value: "all", label: "전체" },
              { value: "active", label: "활성" },
              { value: "inactive", label: "비활성" },
            ]}
            value={value3}
            onValueChange={setValue3}
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Controlled mode로 동작하는 SegmentedControl입니다. 클릭하여 상태 변경을 확인하세요.",
      },
    },
  },
};
