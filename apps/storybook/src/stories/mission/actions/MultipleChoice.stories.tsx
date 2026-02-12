import { MultipleChoice } from "@/components/common/templates/action";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActionMockProvider } from "./ActionMockProvider";

const meta: Meta<typeof MultipleChoice> = {
  title: "Mission/Actions/MultipleChoice",
  component: MultipleChoice,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# MultipleChoice Action

객관식 선택 액션 컴포넌트입니다.

## 특징

- 단일 선택 (radio) / 복수 선택 (checkbox) 지원
- 이미지 옵션 지원
- 기타 옵션 (직접 입력) 지원
- 최대 선택 개수 제한
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
  title: "가장 좋아하는 과일을 선택해주세요",
  description: null,
  imageUrl: null,
  type: "MULTIPLE_CHOICE" as const,
  order: 0,
  isRequired: true,
  hasOther: false,
  maxSelections: 1,
  options: [
    {
      id: "opt-1",
      title: "사과",
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
      title: "바나나",
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
      title: "오렌지",
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
      title: "포도",
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
  nextActionId: null,
  nextCompletionId: null,
  missionId: "mission-1",
  imageFileUploadId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const SingleChoice: Story = {
  render: () => <MultipleChoice actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "단일 선택 (radio) 객관식입니다.",
      },
    },
  },
};

export const MultiSelect: Story = {
  render: () => (
    <MultipleChoice
      actionData={createMockActionData({
        title: "좋아하는 과일을 모두 선택해주세요 (최대 3개)",
        maxSelections: 3,
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "복수 선택 (checkbox) 객관식입니다. 최대 3개까지 선택 가능합니다.",
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => (
    <MultipleChoice
      actionData={createMockActionData({
        title: "선호하는 음료를 선택해주세요",
        options: [
          {
            id: "opt-1",
            title: "아메리카노",
            description: "진한 에스프레소의 풍미",
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
            title: "카페라떼",
            description: "부드러운 우유와 에스프레소의 조화",
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
            title: "카푸치노",
            description: "풍성한 우유 거품",
            imageUrl: null,
            order: 2,
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
        story: "옵션에 설명이 포함된 객관식입니다.",
      },
    },
  },
};

export const WithImages: Story = {
  render: () => (
    <MultipleChoice
      actionData={createMockActionData({
        title: "마음에 드는 디자인을 선택해주세요",
        options: [
          {
            id: "opt-1",
            title: "디자인 A",
            description: null,
            imageUrl: "https://picsum.photos/200/200?random=1",
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
            title: "디자인 B",
            description: null,
            imageUrl: "https://picsum.photos/200/200?random=2",
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
            title: "디자인 C",
            description: null,
            imageUrl: "https://picsum.photos/200/200?random=3",
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
            title: "디자인 D",
            description: null,
            imageUrl: "https://picsum.photos/200/200?random=4",
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
        story: "이미지 옵션이 포함된 객관식입니다. 2열 그리드로 표시됩니다.",
      },
    },
  },
};

export const WithOtherOption: Story = {
  render: () => (
    <MultipleChoice
      actionData={createMockActionData({
        title: "어떤 경로로 저희 서비스를 알게 되셨나요?",
        hasOther: true,
        options: [
          {
            id: "opt-1",
            title: "인스타그램",
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
            title: "유튜브",
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
            title: "지인 추천",
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
        ],
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "기타(직접입력) 옵션이 포함된 객관식입니다.",
      },
    },
  },
};

export const Optional: Story = {
  render: () => (
    <MultipleChoice
      actionData={createMockActionData({
        title: "추가로 관심있는 분야가 있으시면 선택해주세요",
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
