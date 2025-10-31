import type { Meta, StoryObj } from "@storybook/nextjs";
import { ProcessChip } from "@repo/ui/components";

const meta: Meta<typeof ProcessChip> = {
  title: "Common/ProcessChip",
  component: ProcessChip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# ProcessChip

투표 진행 상태를 표시하는 칩 컴포넌트입니다.

## 사용법

\`\`\`tsx
<ProcessChip status="active" />
<ProcessChip status="before" />
<ProcessChip status="after" />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`status\` | \`"before" \\| "active" \\| "after"\` | - | 진행 상태 |
| \`className\` | \`string\` | - | 추가 CSS 클래스 |

## 상태별 표시

- **before**: 진행 전 (회색)
- **active**: 진행 중 (보라색)
- **after**: 진행 후 (회색)

## 특징

- ✅ 세 가지 상태 지원 (진행 전, 진행 중, 진행 후)
- ✅ 일관된 디자인 시스템
- ✅ TypeScript 타입 안전성
- ✅ 커스텀 스타일 지원

## 예시

\`\`\`tsx
// 투표 진행 상태 표시
const pollStatus = calculatePollStatus(startDate, endDate);
<ProcessChip status={pollStatus} />

// 다른 컴포넌트와 조합
<div className="flex items-center gap-2">
  <ProcessChip status="active" />
  <span>현재 진행 중인 투표입니다</span>
</div>
\`\`\``,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["before", "active", "after"],
      description: "투표 진행 상태",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: "active",
  },
};

export const Before: Story = {
  args: {
    status: "before",
  },
};

export const Active: Story = {
  args: {
    status: "active",
  },
};

export const After: Story = {
  args: {
    status: "after",
  },
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
        <div className="flex items-center gap-3">
          <ProcessChip status="before" />
          <span className="text-sm text-gray-600">투표가 시작되기 전</span>
        </div>

        <div className="flex items-center gap-3">
          <ProcessChip status="active" />
          <span className="text-sm text-gray-600">현재 진행 중인 투표</span>
        </div>

        <div className="flex items-center gap-3">
          <ProcessChip status="after" />
          <span className="text-sm text-gray-600">종료된 투표</span>
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
          gap: "20px",
        }}
      >
        <ProcessChip status="active" className="px-3 py-1.5 text-sm" />
        <ProcessChip status="active" className="rounded-full" />
        <ProcessChip status="active" className="font-bold" />
      </div>
    );
  },
};

export const InContext: Story = {
  render: () => {
    return (
      <div style={{ padding: "40px", maxWidth: "400px" }}>
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">좋아하는 과일은?</h3>
              <ProcessChip status="active" />
            </div>
            <p className="text-sm text-gray-600">325명 참여 중</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">올해의 영화는?</h3>
              <ProcessChip status="before" />
            </div>
            <p className="text-sm text-gray-600">3시간 후 시작</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">최고의 음식은?</h3>
              <ProcessChip status="after" />
            </div>
            <p className="text-sm text-gray-600">1,234명 참여함</p>
          </div>
        </div>
      </div>
    );
  },
};
