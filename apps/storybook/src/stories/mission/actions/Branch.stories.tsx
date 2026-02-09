import { Branch } from "@/app/mission/[missionId]/action/[actionId]/ui";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActionMockProvider } from "./ActionMockProvider";

const meta: Meta<typeof Branch> = {
  title: "Mission/Actions/Branch",
  component: Branch,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# Branch Action

분기형 선택 액션 컴포넌트입니다.

## 특징

- 항상 2개의 옵션만 제공
- 선택에 따라 다른 액션/완료 페이지로 분기
- 단일 선택만 가능 (radio)
- 이미지 옵션 지원
- 옵션별 nextActionId, nextCompletionId 설정 가능
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
  title: "다음 중 해당하는 것을 선택해주세요",
  description: null,
  imageUrl: null,
  type: "BRANCH" as const,
  order: 0,
  isRequired: true,
  hasOther: false,
  maxSelections: 1,
  options: [
    { id: "opt-1", title: "옵션 A", description: null, imageUrl: null, order: 0, actionId: "action-1", fileUploadId: null, createdAt: new Date(), updatedAt: new Date(), nextActionId: "action-2a", nextCompletionId: null },
    { id: "opt-2", title: "옵션 B", description: null, imageUrl: null, order: 1, actionId: "action-1", fileUploadId: null, createdAt: new Date(), updatedAt: new Date(), nextActionId: "action-2b", nextCompletionId: null },
  ],
  nextActionId: null,
  nextCompletionId: null,
  missionId: "mission-1",
  imageFileUploadId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const Default: Story = {
  render: () => <Branch actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "기본 분기형 선택 액션입니다. 각 옵션 선택에 따라 다른 경로로 분기됩니다.",
      },
    },
  },
};

export const WithDescriptions: Story = {
  render: () => (
    <Branch
      actionData={createMockActionData({
        title: "어떤 경험을 원하시나요?",
        options: [
          { id: "opt-1", title: "초보자", description: "처음 시작하는 분들을 위한 가이드", imageUrl: null, order: 0, actionId: "action-1", fileUploadId: null, createdAt: new Date(), updatedAt: new Date(), nextActionId: "action-beginner", nextCompletionId: null },
          { id: "opt-2", title: "전문가", description: "깊이 있는 내용을 원하는 분들을 위한 과정", imageUrl: null, order: 1, actionId: "action-1", fileUploadId: null, createdAt: new Date(), updatedAt: new Date(), nextActionId: "action-expert", nextCompletionId: null },
        ],
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "옵션에 설명이 포함된 분기형 선택입니다.",
      },
    },
  },
};

export const WithImages: Story = {
  render: () => (
    <Branch
      actionData={createMockActionData({
        title: "마음에 드는 스타일을 선택해주세요",
        options: [
          { id: "opt-1", title: "스타일 A", description: null, imageUrl: "https://picsum.photos/200/200?random=1", order: 0, actionId: "action-1", fileUploadId: null, createdAt: new Date(), updatedAt: new Date(), nextActionId: "action-style-a", nextCompletionId: null },
          { id: "opt-2", title: "스타일 B", description: null, imageUrl: "https://picsum.photos/200/200?random=2", order: 1, actionId: "action-1", fileUploadId: null, createdAt: new Date(), updatedAt: new Date(), nextActionId: "action-style-b", nextCompletionId: null },
        ],
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "이미지 옵션이 포함된 분기형 선택입니다.",
      },
    },
  },
};

export const DirectToCompletion: Story = {
  render: () => (
    <Branch
      actionData={createMockActionData({
        title: "설문을 계속 진행하시겠습니까?",
        options: [
          { id: "opt-1", title: "예, 계속하겠습니다", description: "다음 질문으로 이동합니다", imageUrl: null, order: 0, actionId: "action-1", fileUploadId: null, createdAt: new Date(), updatedAt: new Date(), nextActionId: "action-continue", nextCompletionId: null },
          { id: "opt-2", title: "아니오, 여기서 마치겠습니다", description: "완료 페이지로 이동합니다", imageUrl: null, order: 1, actionId: "action-1", fileUploadId: null, createdAt: new Date(), updatedAt: new Date(), nextActionId: null, nextCompletionId: "completion-early-exit" },
        ],
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "선택에 따라 완료 페이지로 바로 이동하는 분기형 선택입니다.",
      },
    },
  },
};
