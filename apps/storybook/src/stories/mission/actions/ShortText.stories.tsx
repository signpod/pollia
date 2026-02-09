import { ShortText } from "@/app/mission/[missionId]/action/[actionId]/ui";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActionMockProvider } from "./ActionMockProvider";

const meta: Meta<typeof ShortText> = {
  title: "Mission/Actions/ShortText",
  component: ShortText,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# ShortText Action

짧은 텍스트 입력을 받는 액션 컴포넌트입니다.

## 특징

- 최대 글자 수 제한
- 필수/선택 답변 표시
- 실시간 유효성 검사
- 글자 수 카운터 표시
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
  title: "이름을 입력해주세요",
  description: null,
  imageUrl: null,
  type: "SHORT_TEXT" as const,
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
  render: () => <ShortText actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "기본 짧은 텍스트 입력 액션입니다.",
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => (
    <ShortText
      actionData={createMockActionData({
        title: "연락처를 입력해주세요",
        description: "<p>'-' 없이 숫자만 입력해주세요.</p>",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "설명이 포함된 짧은 텍스트 입력 액션입니다.",
      },
    },
  },
};

export const Optional: Story = {
  render: () => (
    <ShortText
      actionData={createMockActionData({
        title: "추가 의견이 있으시면 입력해주세요",
        isRequired: false,
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "선택 답변인 경우입니다. 입력하지 않아도 다음으로 진행할 수 있습니다.",
      },
    },
  },
};

export const WithImage: Story = {
  render: () => (
    <ShortText
      actionData={createMockActionData({
        title: "이 이미지를 보고 떠오르는 단어를 입력해주세요",
        imageUrl: "https://picsum.photos/400/300",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "이미지가 포함된 짧은 텍스트 입력 액션입니다.",
      },
    },
  },
};
