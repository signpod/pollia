import { ActionPdf } from "@/app/mission/[missionId]/action/[actionId]/ui";
import type { Meta, StoryObj } from "@storybook/nextjs";
import type { GetMissionResponseResponse } from "@/types/dto";
import { ActionMockProvider, createMockMissionResponse } from "./ActionMockProvider";

const meta: Meta<typeof ActionPdf> = {
  title: "Mission/Actions/Pdf",
  component: ActionPdf,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# PDF Action

PDF 파일 업로드 액션 컴포넌트입니다.

## 특징

- PDF 파일 업로드
- 업로드 진행률 표시
- 파일 정보 (이름, 크기) 표시
- 삭제 기능
`,
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story, context) => {
      const missionResponse = context.parameters.missionResponse as GetMissionResponseResponse | undefined;
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
  title: "PDF 파일을 업로드해주세요",
  description: null,
  imageUrl: null,
  type: "PDF" as const,
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
  render: () => <ActionPdf actionData={createMockActionData()} />,
  parameters: {
    docs: {
      description: {
        story: "기본 PDF 업로드 액션입니다.",
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => (
    <ActionPdf
      actionData={createMockActionData({
        title: "이력서를 업로드해주세요",
        description: "<p>PDF 형식의 파일만 업로드 가능합니다. 최대 10MB까지 업로드 가능합니다.</p>",
      })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "설명이 포함된 PDF 업로드 액션입니다.",
      },
    },
  },
};

export const Optional: Story = {
  render: () => (
    <ActionPdf
      actionData={createMockActionData({
        title: "추가 서류가 있으시면 업로드해주세요",
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

const uploadedPdfActionData = createMockActionData({
  title: "이미 업로드된 PDF가 있는 경우",
});

export const WithUploadedPdf: Story = {
  render: () => <ActionPdf actionData={uploadedPdfActionData} />,
  parameters: {
    missionResponse: createMockMissionResponse(uploadedPdfActionData.id, [
      {
        id: "file-1",
        publicUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        filePath: "mock/document.pdf",
        fileName: "이력서.pdf",
        fileSize: 1024 * 500,
        mimeType: "application/pdf",
      },
    ]),
    docs: {
      description: {
        story: "이미 PDF가 업로드된 상태입니다.",
      },
    },
  },
};
