import { MediaUploadNotice } from "@/app/mission/[missionId]/action/[actionId]/ui/components/MediaUploadNotice";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof MediaUploadNotice> = {
  title: "Mission/MediaUploadNotice",
  component: MediaUploadNotice,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# MediaUploadNotice

미디어 업로드 시 유의사항을 표시하는 아코디언 컴포넌트입니다.

## 특징

- 접을 수 있는 아코디언 UI
- 부드러운 애니메이션 (Framer Motion)
- 접근성 지원 (ARIA 속성)
- 커스터마이징 가능한 제목 및 항목

## 사용법

\`\`\`tsx
import { MediaUploadNotice } from "./components/MediaUploadNotice";

const noticeItems = [
  "JPG, JPEG, PNG 형식의 이미지 파일만 업로드할 수 있습니다.",
  "이미지 파일은 개당 5MB 이하만 업로드할 수 있습니다.",
  "파일 첨부는 최대 10개까지 가능합니다.",
];

<MediaUploadNotice title="사진 첨부 유의사항" noticeItems={noticeItems} />
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: { type: "text" },
      description: "아코디언 제목",
    },
    noticeItems: {
      control: { type: "object" },
      description: "유의사항 항목 배열",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const imageNoticeItems = [
  "JPG, JPEG, PNG, WEBP 형식의 이미지 파일만 업로드할 수 있습니다.",
  "이미지 파일은 개당 5MB 이하만 업로드할 수 있습니다.",
  "파일 첨부는 최대 10개까지 가능합니다.",
];

const videoNoticeItems = [
  "MP4, MOV, AVI 형식의 동영상 파일만 업로드할 수 있습니다.",
  "동영상 파일은 개당 50MB 이하만 업로드할 수 있습니다.",
  "파일 첨부는 최대 10개까지 가능합니다.",
];

export const Default: Story = {
  args: {
    title: "사진 첨부 유의사항",
    noticeItems: imageNoticeItems,
  },
  parameters: {
    docs: {
      description: {
        story: "기본 상태의 MediaUploadNotice입니다. 클릭하여 열고 닫을 수 있습니다.",
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">이미지 업로드 유의사항</h3>
        <MediaUploadNotice title="사진 첨부 유의사항" noticeItems={imageNoticeItems} />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">비디오 업로드 유의사항</h3>
        <MediaUploadNotice title="동영상 첨부 유의사항" noticeItems={videoNoticeItems} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "이미지와 비디오 업로드를 위한 두 가지 variant를 확인할 수 있습니다.",
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">닫힌 상태</h3>
        <MediaUploadNotice title="사진 첨부 유의사항" noticeItems={imageNoticeItems} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "기본적으로 닫힌 상태로 표시됩니다. 제목을 클릭하여 열 수 있습니다.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <MediaUploadNotice title="사진 첨부 유의사항" noticeItems={imageNoticeItems} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "제목을 클릭하여 아코디언을 열고 닫을 수 있습니다. 부드러운 애니메이션이 적용됩니다.",
      },
    },
  },
};

export const LongContent: Story = {
  render: () => {
    const longNoticeItems = [
      "JPG, JPEG, PNG, WEBP 형식의 이미지 파일만 업로드할 수 있습니다.",
      "이미지 파일은 개당 5MB 이하만 업로드할 수 있습니다.",
      "파일 첨부는 최대 10개까지 가능합니다.",
      "이미지 파일은 자동으로 압축될 수 있습니다.",
      "저작권이 있는 이미지는 업로드할 수 없습니다.",
      "부적절한 내용이 포함된 이미지는 삭제될 수 있습니다.",
    ];

    return (
      <div className="w-full max-w-md">
        <MediaUploadNotice title="사진 첨부 유의사항" noticeItems={longNoticeItems} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "많은 항목이 있어도 아코디언이 부드럽게 확장됩니다.",
      },
    },
  },
};

