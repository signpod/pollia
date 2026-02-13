import { ActionTag } from "@/components/common/templates/action";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActionMockProvider } from "./ActionMockProvider";

const meta: Meta<typeof ActionTag> = {
  title: "Mission/Actions/Tag",
  component: ActionTag,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# Tag Action

태그 형태의 선택 액션 컴포넌트입니다.

## 특징

- 칩(Chip) 형태의 선택 UI
- 단일/복수 선택 지원
- 기타 옵션 (직접 입력) 지원
- 최대 선택 개수 제한
- 하단 Drawer에서 선택 항목 확인/삭제 가능
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
  title: "관심 있는 분야를 선택해주세요",
  description: null,
  imageUrl: null,
  type: "TAG" as const,
  order: 0,
  isRequired: true,
  hasOther: false,
  maxSelections: 3,
  options: [
    {
      id: "opt-1",
      title: "IT/테크",
      description: null,
      imageUrl: null,
      order: 0,
      actionId: "action-1",
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextActionId: null,
      nextCompletionId: null,
    },
    {
      id: "opt-2",
      title: "디자인",
      description: null,
      imageUrl: null,
      order: 1,
      actionId: "action-1",
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextActionId: null,
      nextCompletionId: null,
    },
    {
      id: "opt-3",
      title: "마케팅",
      description: null,
      imageUrl: null,
      order: 2,
      actionId: "action-1",
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextActionId: null,
      nextCompletionId: null,
    },
    {
      id: "opt-4",
      title: "금융",
      description: null,
      imageUrl: null,
      order: 3,
      actionId: "action-1",
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextActionId: null,
      nextCompletionId: null,
    },
    {
      id: "opt-5",
      title: "교육",
      description: null,
      imageUrl: null,
      order: 4,
      actionId: "action-1",
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextActionId: null,
      nextCompletionId: null,
    },
    {
      id: "opt-6",
      title: "헬스케어",
      description: null,
      imageUrl: null,
      order: 5,
      actionId: "action-1",
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextActionId: null,
      nextCompletionId: null,
    },
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
  render: () => <ActionTag actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "기본 태그 선택 액션입니다. 최대 3개까지 선택 가능합니다.",
      },
    },
  },
};

export const SingleSelect: Story = {
  render: () => (
    <ActionTag
      actionData={createMockActionData({
        title: "가장 관심 있는 분야 하나를 선택해주세요",
        maxSelections: 1,
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "단일 선택 태그 액션입니다.",
      },
    },
  },
};

export const ManyOptions: Story = {
  render: () => (
    <ActionTag
      actionData={createMockActionData({
        title: "좋아하는 음식을 선택해주세요 (최대 5개)",
        maxSelections: 5,
        options: [
          {
            id: "opt-1",
            title: "한식",
            description: null,
            imageUrl: null,
            order: 0,
            actionId: "action-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-2",
            title: "중식",
            description: null,
            imageUrl: null,
            order: 1,
            actionId: "action-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-3",
            title: "일식",
            description: null,
            imageUrl: null,
            order: 2,
            actionId: "action-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-4",
            title: "양식",
            description: null,
            imageUrl: null,
            order: 3,
            actionId: "action-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-5",
            title: "베트남",
            description: null,
            imageUrl: null,
            order: 4,
            actionId: "action-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-6",
            title: "태국",
            description: null,
            imageUrl: null,
            order: 5,
            actionId: "action-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-7",
            title: "인도",
            description: null,
            imageUrl: null,
            order: 6,
            actionId: "action-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-8",
            title: "멕시코",
            description: null,
            imageUrl: null,
            order: 7,
            actionId: "action-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
        ],
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "많은 옵션이 있는 태그 선택 액션입니다.",
      },
    },
  },
};

export const WithOtherOption: Story = {
  render: () => (
    <ActionTag
      actionData={createMockActionData({
        title: "취미를 선택해주세요",
        hasOther: true,
        options: [
          {
            id: "opt-1",
            title: "운동",
            description: null,
            imageUrl: null,
            order: 0,
            actionId: "action-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-2",
            title: "독서",
            description: null,
            imageUrl: null,
            order: 1,
            actionId: "action-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-3",
            title: "영화 감상",
            description: null,
            imageUrl: null,
            order: 2,
            actionId: "action-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-4",
            title: "여행",
            description: null,
            imageUrl: null,
            order: 3,
            actionId: "action-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
        ],
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "기타(직접입력) 옵션이 포함된 태그 선택 액션입니다.",
      },
    },
  },
};

export const Optional: Story = {
  render: () => (
    <ActionTag
      actionData={createMockActionData({
        title: "추가 키워드가 있으면 선택해주세요",
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
