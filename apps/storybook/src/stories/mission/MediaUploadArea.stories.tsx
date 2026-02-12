import { MediaUploadArea } from "@/components/common/templates/action/common/MediaUploadArea";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useRef, useState } from "react";

const meta: Meta<typeof MediaUploadArea> = {
  title: "Mission/MediaUploadArea",
  component: MediaUploadArea,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# MediaUploadArea

미디어 파일(이미지/비디오) 업로드를 위한 드래그 앤 드롭 영역 컴포넌트입니다.

## 특징

- 이미지 및 비디오 업로드 지원
- 아이콘 타입 선택 가능 (image/video)
- 업로드 중 상태 표시
- 터치 디바이스 지원

## 사용법

\`\`\`tsx
import { MediaUploadArea } from "./components/MediaUploadArea";
import { useRef } from "react";

function MyComponent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 처리 로직
    }
  };

  return (
    <MediaUploadArea
      inputRef={inputRef}
      isUploading={isUploading}
      onFileSelect={handleFileSelect}
      onFileChange={handleFileChange}
      accept="image/*"
      buttonText="사진 첨부"
      icon="image"
    />
  );
}
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    accept: {
      control: { type: "text" },
      description: "허용할 파일 타입 (HTML input accept 속성)",
    },
    buttonText: {
      control: { type: "text" },
      description: "버튼에 표시될 텍스트",
    },
    icon: {
      control: { type: "radio" },
      options: ["image", "video"],
      description: "표시할 아이콘 타입",
    },
    isUploading: {
      control: { type: "boolean" },
      description: "업로드 중 상태",
    },
    onFileSelect: {
      description: "파일 선택 버튼 클릭 핸들러",
    },
    onFileChange: {
      description: "파일 선택 변경 핸들러",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveDemo({
  icon,
  buttonText,
  accept,
}: { icon?: "image" | "video"; buttonText?: string; accept?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-md">
      <MediaUploadArea
        inputRef={inputRef}
        isUploading={isUploading}
        onFileSelect={handleFileSelect}
        onFileChange={handleFileChange}
        accept={accept}
        buttonText={buttonText}
        icon={icon}
      />
      {selectedFile && (
        <div className="p-3 bg-gray-100 rounded text-sm">
          <p className="font-medium">선택된 파일:</p>
          <p className="text-gray-600">{selectedFile.name}</p>
          <p className="text-gray-500 text-xs">{(selectedFile.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
    </div>
  );
}

export const Default: Story = {
  render: () => <InteractiveDemo />,
  parameters: {
    docs: {
      description: {
        story: "기본 이미지 업로드 영역입니다.",
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">이미지 업로드</h3>
        <InteractiveDemo icon="image" buttonText="사진 첨부" accept="image/*,.heic,.heif" />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-500">비디오 업로드</h3>
        <InteractiveDemo icon="video" buttonText="동영상 첨부" accept="video/*" />
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
  render: () => {
    const inputRef1 = useRef<HTMLInputElement>(null);
    const inputRef2 = useRef<HTMLInputElement>(null);

    return (
      <div className="space-y-6 w-full max-w-md">
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-500">일반 상태</h3>
          <MediaUploadArea
            inputRef={inputRef1}
            isUploading={false}
            onFileSelect={() => inputRef1.current?.click()}
            onFileChange={() => {}}
            buttonText="사진 첨부"
            icon="image"
          />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-500">업로드 중</h3>
          <MediaUploadArea
            inputRef={inputRef2}
            isUploading={true}
            onFileSelect={() => inputRef2.current?.click()}
            onFileChange={() => {}}
            buttonText="사진 첨부"
            icon="image"
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "일반 상태와 업로드 중 상태를 확인할 수 있습니다. 업로드 중에는 버튼이 비활성화되고 투명도가 낮아집니다.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => <InteractiveDemo icon="image" buttonText="사진 첨부" accept="image/*" />,
  parameters: {
    docs: {
      description: {
        story: "파일을 선택하면 파일 정보가 표시됩니다. 실제 파일 업로드는 구현되지 않았습니다.",
      },
    },
  },
};
