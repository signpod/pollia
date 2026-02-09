import { ActionTime } from "@/app/mission/[missionId]/action/[actionId]/ui";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActionMockProvider } from "./ActionMockProvider";

const meta: Meta<typeof ActionTime> = {
  title: "Mission/Actions/Time",
  component: ActionTime,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# Time Action

시간 선택 액션 컴포넌트입니다.

## 특징

- 시간 선택 다이얼로그
- 오전/오후 선택
- 시/분 선택 (휠 UI)
- 복수 시간 선택 지원
- 선택한 시간 삭제 가능
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
  title: "가능한 시간을 선택해주세요",
  description: null,
  imageUrl: null,
  type: "TIME" as const,
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

export const SingleTime: Story = {
  render: () => <ActionTime actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "단일 시간 선택 액션입니다.",
      },
    },
  },
};

export const MultipleTimes: Story = {
  render: () => (
    <ActionTime
      actionData={createMockActionData({
        title: "가능한 시간대를 모두 선택해주세요 (최대 5개)",
        maxSelections: 5,
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "복수 시간 선택 액션입니다. 최대 5개까지 선택 가능합니다.",
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => (
    <ActionTime
      actionData={createMockActionData({
        title: "미팅 가능 시간을 선택해주세요",
        description: "<p>30분 단위로 선택해주세요.</p>",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "설명이 포함된 시간 선택 액션입니다.",
      },
    },
  },
};

export const Optional: Story = {
  render: () => (
    <ActionTime
      actionData={createMockActionData({
        title: "선호하는 시간이 있으시면 선택해주세요",
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
