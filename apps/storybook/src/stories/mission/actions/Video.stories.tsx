import { ActionVideo } from "@/app/mission/[missionId]/action/[actionId]/ui";
import type { GetMissionResponseResponse } from "@/types/dto";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActionMockProvider, createMockMissionResponse } from "./ActionMockProvider";

const meta: Meta<typeof ActionVideo> = {
  title: "Mission/Actions/Video",
  component: ActionVideo,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# Video Action

동영상 업로드 액션 컴포넌트입니다.

## 특징

- 동영상 파일 업로드
- 업로드 진행률 표시
- 파일 정보 (이름, 크기) 표시
- 업로드된 동영상 미리보기
- 삭제 기능
`,
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story, context) => {
      const missionResponse = context.parameters.missionResponse as
        | GetMissionResponseResponse
        | undefined;
      return (
        <ActionMockProvider missionResponse={missionResponse}>
          <Story />
        </ActionMockProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockActionData = (overrides = {}) => ({
  id: "action-1",
  title: "동영상을 업로드해주세요",
  description: null,
  imageUrl: null,
  type: "VIDEO" as const,
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
  render: () => <ActionVideo actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "기본 동영상 업로드 액션입니다.",
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => (
    <ActionVideo
      actionData={createMockActionData({
        title: "제품 사용 영상을 업로드해주세요",
        description: "<p>30초 이내의 영상을 권장합니다. 최대 100MB까지 업로드 가능합니다.</p>",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "설명이 포함된 동영상 업로드 액션입니다.",
      },
    },
  },
};

export const Optional: Story = {
  render: () => (
    <ActionVideo
      actionData={createMockActionData({
        title: "추가 영상이 있으시면 업로드해주세요",
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

const uploadedVideoActionData = createMockActionData({
  title: "이미 업로드된 동영상이 있는 경우",
});

export const WithUploadedVideo: Story = {
  render: () => <ActionVideo actionData={uploadedVideoActionData} />,
  parameters: {
    missionResponse: createMockMissionResponse(uploadedVideoActionData.id, [
      {
        id: "file-1",
        publicUrl:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        filePath: "mock/video1.mp4",
        fileName: "제품소개영상.mp4",
        fileSize: 1024 * 1024 * 5,
        mimeType: "video/mp4",
      },
    ]),
    docs: {
      description: {
        story: "이미 동영상이 업로드된 상태입니다.",
      },
    },
  },
};
