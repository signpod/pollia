import { ActionDate } from "@/components/common/templates/action";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActionMockProvider } from "./ActionMockProvider";

const meta: Meta<typeof ActionDate> = {
  title: "Mission/Actions/Date",
  component: ActionDate,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# Date Action

날짜 선택 액션 컴포넌트입니다.

## 특징

- 캘린더 UI로 날짜 선택
- 단일/복수 날짜 선택 지원
- 공휴일 표시
- 과거 날짜 선택 불가
- 선택된 날짜 하단 Drawer에서 확인/삭제 가능
`,
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <ActionMockProvider>
        <Story />
      </ActionMockProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockActionData = (overrides = {}) => ({
  id: "action-1",
  title: "참여 가능한 날짜를 선택해주세요",
  description: null,
  imageUrl: null,
  type: "DATE" as const,
  order: 0,
  isRequired: true,
  hasOther: false,
  maxSelections: 1,
  options: [],
  nextActionId: null,
  nextCompletionId: null,
  missionId: "mission-1",
  imageFileUploadId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const SingleDate: Story = {
  render: () => <ActionDate actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "단일 날짜 선택입니다.",
      },
    },
  },
};

export const MultipleDate: Story = {
  render: () => (
    <ActionDate
      actionData={createMockActionData({
        title: "참여 가능한 날짜를 모두 선택해주세요 (최대 5개)",
        maxSelections: 5,
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "복수 날짜 선택입니다. 하단 Drawer에서 선택된 날짜를 확인하고 삭제할 수 있습니다.",
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => (
    <ActionDate
      actionData={createMockActionData({
        title: "배송 희망일을 선택해주세요",
        description: "<p>주문일로부터 3일 이후의 날짜만 선택 가능합니다.</p>",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "설명이 포함된 날짜 선택입니다.",
      },
    },
  },
};

export const ManySelections: Story = {
  render: () => (
    <ActionDate
      actionData={createMockActionData({
        title: "이번 달 중 가능한 날짜를 모두 선택해주세요",
        maxSelections: 20,
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "많은 수의 날짜를 선택할 수 있는 경우입니다.",
      },
    },
  },
};

export const Optional: Story = {
  render: () => (
    <ActionDate
      actionData={createMockActionData({
        title: "선호하는 날짜가 있으시면 선택해주세요",
        isRequired: false,
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "선택 답변인 경우입니다.",
      },
    },
  },
};
