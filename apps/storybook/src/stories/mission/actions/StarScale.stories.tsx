import { MissionStarScale } from "@/app/mission/[missionId]/action/[actionId]/ui";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActionMockProvider } from "./ActionMockProvider";

const meta: Meta<typeof MissionStarScale> = {
  title: "Mission/Actions/StarScale",
  component: MissionStarScale,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# StarScale Action

별점 평가 액션 컴포넌트입니다.

## 특징

- 5점 만점 별점 평가
- 터치/클릭으로 별점 선택
- 시각적 피드백 (별 채우기 애니메이션)
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
  title: "서비스 만족도를 별점으로 평가해주세요",
  description: null,
  imageUrl: null,
  type: "RATING" as const,
  order: 0,
  isRequired: true,
  hasOther: false,
  maxSelections: null,
  options: [],
  nextActionId: null,
  nextCompletionId: null,
  missionId: "mission-1",
  imageFileUploadId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const Default: Story = {
  render: () => <MissionStarScale actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "기본 별점 평가 액션입니다.",
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => (
    <MissionStarScale
      actionData={createMockActionData({
        title: "제품 품질을 평가해주세요",
        description: "<p>1점(매우 나쁨)부터 5점(매우 좋음)까지 평가해주세요.</p>",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "설명이 포함된 별점 평가 액션입니다.",
      },
    },
  },
};

export const WithImage: Story = {
  render: () => (
    <MissionStarScale
      actionData={createMockActionData({
        title: "이 제품에 대해 별점을 매겨주세요",
        imageUrl: "https://picsum.photos/400/300",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "이미지가 포함된 별점 평가 액션입니다.",
      },
    },
  },
};

export const Optional: Story = {
  render: () => (
    <MissionStarScale
      actionData={createMockActionData({
        title: "추가 평가를 원하시면 별점을 선택해주세요",
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
