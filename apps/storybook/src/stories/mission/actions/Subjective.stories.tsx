import { Subjective } from "@/app/mission/[missionId]/action/[actionId]/ui";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActionMockProvider } from "./ActionMockProvider";

const meta: Meta<typeof Subjective> = {
  title: "Mission/Actions/Subjective",
  component: Subjective,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# Subjective Action

장문 텍스트 입력을 받는 액션 컴포넌트입니다.

## 특징

- 여러 줄 텍스트 입력 가능
- 최대 글자 수 제한
- 필수/선택 답변 표시
- 실시간 유효성 검사
- 글자 수 카운터 표시
- 크기 조절 가능
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
  title: "자유롭게 의견을 작성해주세요",
  description: null,
  imageUrl: null,
  type: "SUBJECTIVE" as const,
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
  render: () => <Subjective actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "기본 장문 텍스트 입력 액션입니다.",
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => (
    <Subjective
      actionData={createMockActionData({
        title: "서비스를 이용하면서 불편했던 점을 알려주세요",
        description: "<p>솔직한 의견을 남겨주시면 서비스 개선에 큰 도움이 됩니다.</p>",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "설명이 포함된 장문 텍스트 입력 액션입니다.",
      },
    },
  },
};

export const Optional: Story = {
  render: () => (
    <Subjective
      actionData={createMockActionData({
        title: "추가로 하고 싶은 말이 있으시면 자유롭게 작성해주세요",
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

export const WithImage: Story = {
  render: () => (
    <Subjective
      actionData={createMockActionData({
        title: "이 제품에 대한 상세한 후기를 작성해주세요",
        imageUrl: "https://picsum.photos/400/300",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "이미지가 포함된 장문 텍스트 입력 액션입니다.",
      },
    },
  },
};
