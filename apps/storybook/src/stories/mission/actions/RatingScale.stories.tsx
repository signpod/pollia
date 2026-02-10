import { MissionRatingScale } from "@/app/mission/[missionId]/action/[actionId]/ui";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActionMockProvider } from "./ActionMockProvider";

const meta: Meta<typeof MissionRatingScale> = {
  title: "Mission/Actions/RatingScale",
  component: MissionRatingScale,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# RatingScale Action

평가 척도 액션 컴포넌트입니다.

## 특징

- 슬라이더 형태의 평가 척도
- 옵션 개수에 따른 자동 레이아웃 (수평/수직)
- 옵션에 설명 추가 가능
- 터치/드래그 인터랙션 지원
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
  title: "서비스에 얼마나 만족하시나요?",
  description: null,
  imageUrl: null,
  type: "SCALE" as const,
  order: 0,
  isRequired: true,
  hasOther: false,
  maxSelections: null,
  options: [
    {
      id: "opt-1",
      title: "매우 불만족",
      description: null,
      order: 0,
      actionId: "action-1",
      imageUrl: null,
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextActionId: null,
      nextCompletionId: null,
    },
    {
      id: "opt-2",
      title: "불만족",
      description: null,
      order: 1,
      actionId: "action-1",
      imageUrl: null,
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextActionId: null,
      nextCompletionId: null,
    },
    {
      id: "opt-3",
      title: "보통",
      description: null,
      order: 2,
      actionId: "action-1",
      imageUrl: null,
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextActionId: null,
      nextCompletionId: null,
    },
    {
      id: "opt-4",
      title: "만족",
      description: null,
      order: 3,
      actionId: "action-1",
      imageUrl: null,
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextActionId: null,
      nextCompletionId: null,
    },
    {
      id: "opt-5",
      title: "매우 만족",
      description: null,
      order: 4,
      actionId: "action-1",
      imageUrl: null,
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

export const FiveOptions: Story = {
  render: () => <MissionRatingScale actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "5개 옵션의 기본 평가 척도입니다.",
      },
    },
  },
};

export const ThreeOptions: Story = {
  render: () => (
    <MissionRatingScale
      actionData={createMockActionData({
        title: "이 기능이 유용했나요?",
        options: [
          {
            id: "opt-1",
            title: "아니오",
            description: null,
            order: 0,
            actionId: "action-1",
            imageUrl: null,
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-2",
            title: "보통",
            description: null,
            order: 1,
            actionId: "action-1",
            imageUrl: null,
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-3",
            title: "예",
            description: null,
            order: 2,
            actionId: "action-1",
            imageUrl: null,
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
        story: "3개 옵션의 평가 척도입니다.",
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => (
    <MissionRatingScale
      actionData={createMockActionData({
        title: "다음 항목에 대해 평가해주세요",
        description: "<p>1점(매우 나쁨)부터 5점(매우 좋음)까지 평가해주세요.</p>",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "설명이 포함된 평가 척도입니다.",
      },
    },
  },
};

export const WithOptionDescriptions: Story = {
  render: () => (
    <MissionRatingScale
      actionData={createMockActionData({
        title: "추천 의향을 알려주세요",
        options: [
          {
            id: "opt-1",
            title: "1점",
            description: "전혀 추천하지 않음",
            order: 0,
            actionId: "action-1",
            imageUrl: null,
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-2",
            title: "2점",
            description: "추천하지 않음",
            order: 1,
            actionId: "action-1",
            imageUrl: null,
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-3",
            title: "3점",
            description: "보통",
            order: 2,
            actionId: "action-1",
            imageUrl: null,
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-4",
            title: "4점",
            description: "추천함",
            order: 3,
            actionId: "action-1",
            imageUrl: null,
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            nextActionId: null,
            nextCompletionId: null,
          },
          {
            id: "opt-5",
            title: "5점",
            description: "적극 추천함",
            order: 4,
            actionId: "action-1",
            imageUrl: null,
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
        story: "각 옵션에 설명이 포함된 평가 척도입니다. 수직 레이아웃으로 표시됩니다.",
      },
    },
  },
};

export const WithImage: Story = {
  render: () => (
    <MissionRatingScale
      actionData={createMockActionData({
        title: "이 이미지가 마음에 드시나요?",
        imageUrl: "https://picsum.photos/400/300",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "이미지가 포함된 평가 척도입니다.",
      },
    },
  },
};

export const Optional: Story = {
  render: () => (
    <MissionRatingScale
      actionData={createMockActionData({
        title: "추가 평가를 원하시면 선택해주세요",
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
