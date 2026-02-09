import { ActionUrl } from "@/app/mission/[missionId]/action/[actionId]/ui";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActionMockProvider } from "./ActionMockProvider";

const meta: Meta<typeof ActionUrl> = {
  title: "Mission/Actions/Url",
  component: ActionUrl,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# URL Action

URL 입력 액션 컴포넌트입니다.

## 특징

- URL 형식 유효성 검사
- http:// 또는 https:// 프로토콜 필수
- 실시간 에러 메시지 표시
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
  title: "URL을 입력해주세요",
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
  render: () => <ActionUrl actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "기본 URL 입력 액션입니다.",
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => (
    <ActionUrl
      actionData={createMockActionData({
        title: "블로그 또는 포트폴리오 URL을 입력해주세요",
        description: "<p>http:// 또는 https://로 시작하는 유효한 URL을 입력해주세요.</p>",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "설명이 포함된 URL 입력 액션입니다.",
      },
    },
  },
};

export const SocialMediaUrl: Story = {
  render: () => (
    <ActionUrl
      actionData={createMockActionData({
        title: "인스타그램 프로필 URL을 입력해주세요",
        description: "<p>예: https://instagram.com/username</p>",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "소셜 미디어 URL 입력 예시입니다.",
      },
    },
  },
};

export const Optional: Story = {
  render: () => (
    <ActionUrl
      actionData={createMockActionData({
        title: "참고할 URL이 있으시면 입력해주세요",
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
