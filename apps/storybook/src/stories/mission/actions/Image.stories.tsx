import { ActionImage } from "@/app/mission/[missionId]/action/[actionId]/ui";
import type { GetMissionResponseResponse } from "@/types/dto";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActionMockProvider, createMockMissionResponse } from "./ActionMockProvider";

const meta: Meta<typeof ActionImage> = {
  title: "Mission/Actions/Image",
  component: ActionImage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# Image Action

이미지 업로드 액션 컴포넌트입니다.

## 특징

- 최대 9장 이미지 업로드 가능
- 이미지 크롭 기능
- 업로드 진행률 표시
- 이미지 삭제/편집 가능
- 드래그 앤 드롭 지원
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
  title: "사진을 업로드해주세요",
  description: null,
  imageUrl: null,
  type: "IMAGE" as const,
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
  render: () => <ActionImage actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "기본 이미지 업로드 액션입니다.",
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => (
    <ActionImage
      actionData={createMockActionData({
        title: "제품 사용 사진을 업로드해주세요",
        description: "<p>얼굴이 나온 사진은 제외해주세요. 최대 9장까지 업로드 가능합니다.</p>",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "설명이 포함된 이미지 업로드 액션입니다.",
      },
    },
  },
};

export const WithExampleImage: Story = {
  render: () => (
    <ActionImage
      actionData={createMockActionData({
        title: "이런 느낌의 사진을 업로드해주세요",
        imageUrl: "https://picsum.photos/400/300",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "예시 이미지가 포함된 이미지 업로드 액션입니다.",
      },
    },
  },
};

export const Optional: Story = {
  render: () => (
    <ActionImage
      actionData={createMockActionData({
        title: "추가 사진이 있으시면 업로드해주세요",
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

const uploadedImagesActionData = createMockActionData({
  title: "이미 업로드된 이미지가 있는 경우",
});

export const WithUploadedImages: Story = {
  render: () => <ActionImage actionData={uploadedImagesActionData} />,
  parameters: {
    missionResponse: createMockMissionResponse(uploadedImagesActionData.id, [
      {
        id: "file-1",
        publicUrl: "https://picsum.photos/200/200?random=10",
        filePath: "mock/image1.jpg",
        fileName: "사진1.jpg",
        fileSize: 1024 * 200,
        mimeType: "image/jpeg",
      },
      {
        id: "file-2",
        publicUrl: "https://picsum.photos/200/200?random=11",
        filePath: "mock/image2.jpg",
        fileName: "사진2.jpg",
        fileSize: 1024 * 150,
        mimeType: "image/jpeg",
      },
      {
        id: "file-3",
        publicUrl: "https://picsum.photos/200/200?random=12",
        filePath: "mock/image3.jpg",
        fileName: "사진3.jpg",
        fileSize: 1024 * 180,
        mimeType: "image/jpeg",
      },
    ]),
    docs: {
      description: {
        story: "이미 이미지가 업로드된 상태입니다. 기존 답변을 수정하는 경우에 해당합니다.",
      },
    },
  },
};
