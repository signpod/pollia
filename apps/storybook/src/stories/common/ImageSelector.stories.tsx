import { Meta, StoryObj } from "@storybook/nextjs";
import { ImageSelector } from "@repo/ui/components";
import { useState, useEffect } from "react";

const meta: Meta<typeof ImageSelector> = {
  title: "Common/ImageSelector",
  component: ImageSelector,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# ImageSelector

실제 파일을 선택하고 관리할 수 있는 이미지 선택 컴포넌트입니다. 클릭하여 파일 브라우저를 열고 이미지를 선택하거나, 기존 이미지를 삭제할 수 있습니다.

## 특징

- **실제 파일 선택**: input type="file"을 사용한 네이티브 파일 선택
- **두 가지 크기**: Large (72x72px), Medium (48x48px)
- **상태 관리**: 이미지 없음, 이미지 있음, 비활성화
- **미리보기**: 선택한 이미지를 즉시 미리보기로 표시
- **메모리 관리**: URL.createObjectURL 메모리 누수 방지
- **Lucide 아이콘**: ImagePlus, X 아이콘 사용
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원

## Props

| Prop | Type | Description |
|------|------|-------------|
| \`size\` | \`"large" \\| "medium"\` | 컴포넌트 크기 (기본값: "large") |
| \`imageUrl\` | \`string\` | 현재 선택된 이미지 URL |
| \`onImageSelect\` | \`(file: File) => void\` | 파일 선택 시 호출되는 콜백 |
| \`onImageDelete\` | \`() => void\` | 이미지 삭제 시 호출되는 콜백 |
| \`disabled\` | \`boolean\` | 비활성화 상태 |
| \`className\` | \`string\` | 추가 CSS 클래스 |
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["large", "medium"],
      description: "컴포넌트 크기",
    },
    imageUrl: {
      control: { type: "text" },
      description: "이미지 URL",
    },
    onImageSelect: {
      action: "fileSelected",
      description: "파일 선택 콜백 (File 객체 전달)",
    },
    onImageDelete: {
      action: "imageDeleted",
      description: "이미지 삭제 콜백",
    },
    disabled: {
      control: { type: "boolean" },
      description: "비활성화 상태",
    },
    className: {
      control: { type: "text" },
      description: "추가 CSS 클래스",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 상태 - Large
export const DefaultLarge: Story = {
  args: {
    size: "large",
  },
  parameters: {
    docs: {
      description: {
        story:
          "기본 상태의 Large 크기 ImageSelector입니다. 클릭하여 이미지를 추가할 수 있습니다.",
      },
    },
  },
};

// 기본 상태 - Medium
export const DefaultMedium: Story = {
  args: {
    size: "medium",
  },
  parameters: {
    docs: {
      description: {
        story: "기본 상태의 Medium 크기 ImageSelector입니다.",
      },
    },
  },
};

// 이미지가 있는 상태 - Large
export const WithImageLarge: Story = {
  args: {
    size: "large",
    imageUrl:
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=150&h=150&fit=crop&crop=center",
  },
  parameters: {
    docs: {
      description: {
        story:
          "이미지가 선택된 상태입니다. 우상단의 X 버튼을 클릭하여 이미지를 삭제할 수 있습니다.",
      },
    },
  },
};

// 이미지가 있는 상태 - Medium
export const WithImageMedium: Story = {
  args: {
    size: "medium",
    imageUrl:
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=150&h=150&fit=crop&crop=center",
  },
  parameters: {
    docs: {
      description: {
        story: "Medium 크기에서 이미지가 선택된 상태입니다.",
      },
    },
  },
};

// 비활성화 상태
export const Disabled: Story = {
  args: {
    size: "large",
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "비활성화된 상태입니다. 클릭이나 상호작용이 불가능합니다.",
      },
    },
  },
};

// 비활성화 + 이미지 있는 상태
export const DisabledWithImage: Story = {
  args: {
    size: "large",
    disabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=150&h=150&fit=crop&crop=center",
  },
  parameters: {
    docs: {
      description: {
        story: "이미지가 있는 상태에서 비활성화된 경우입니다.",
      },
    },
  },
};

// 크기 비교
export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-center space-y-2">
        <ImageSelector size="large" />
        <p className="text-sm text-gray-600">Large (72x72px)</p>
      </div>
      <div className="text-center space-y-2">
        <ImageSelector size="medium" />
        <p className="text-sm text-gray-600">Medium (48x48px)</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Large와 Medium 크기를 나란히 비교한 예시입니다.",
      },
    },
  },
};

// 인터랙티브 예시
export const Interactive: Story = {
  render: () => {
    const [imageUrl, setImageUrl] = useState<string>();
    const [fileName, setFileName] = useState<string>();

    // 컴포넌트 언마운트 시 메모리 정리
    useEffect(() => {
      return () => {
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
        }
      };
    }, [imageUrl]);

    const handleImageSelect = (file: File) => {
      // 기존 URL이 있다면 먼저 메모리 해제
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }

      // 선택된 파일을 미리보기 URL로 변환
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setFileName(file.name);
    };

    const handleImageDelete = () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl(undefined);
      setFileName(undefined);
    };

    return (
      <div className="space-y-4">
        <ImageSelector
          size="large"
          imageUrl={imageUrl}
          onImageSelect={handleImageSelect}
          onImageDelete={handleImageDelete}
        />
        <div className="text-sm text-gray-600">
          {imageUrl ? (
            <div className="space-y-1">
              <p>✅ 이미지가 선택되었습니다.</p>
              <p className="text-xs text-gray-500">파일명: {fileName}</p>
              <p className="text-xs text-gray-400">
                X 버튼을 클릭하여 삭제할 수 있습니다.
              </p>
            </div>
          ) : (
            <p>📷 클릭하여 이미지 파일을 선택해보세요.</p>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "실제로 파일을 선택할 수 있는 ImageSelector 예시입니다. 클릭하면 파일 브라우저가 열리고, 이미지를 선택할 수 있습니다.",
      },
    },
  },
};

// 폼에서 사용하는 예시
export const InForm: Story = {
  render: () => {
    const [images, setImages] = useState<{ url: string; name: string }[]>([]);

    // 컴포넌트 언마운트 시 모든 URL 메모리 정리
    useEffect(() => {
      return () => {
        images.forEach((image) => {
          URL.revokeObjectURL(image.url);
        });
      };
    }, [images]);

    const addImage = (file: File) => {
      if (images.length >= 4) return;

      const url = URL.createObjectURL(file);
      setImages([...images, { url, name: file.name }]);
    };

    const deleteImage = (index: number) => {
      const imageToDelete = images[index];
      if (imageToDelete) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      setImages(images.filter((_, i) => i !== index));
    };

    return (
      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            투표 옵션 이미지 (선택사항)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <ImageSelector
                key={index}
                size="medium"
                imageUrl={image.url}
                onImageSelect={addImage}
                onImageDelete={() => deleteImage(index)}
              />
            ))}
            {images.length < 4 && (
              <ImageSelector size="medium" onImageSelect={addImage} />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            최대 4개의 이미지를 추가할 수 있습니다.
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">
            선택된 이미지: {images.length}개
          </p>
          {images.length > 0 && (
            <div className="mt-2 space-y-1">
              {images.map((image, index) => (
                <p key={index} className="text-xs text-gray-500">
                  {index + 1}. {image.name}
                </p>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            + 버튼을 클릭하여 이미지를 추가하고, X 버튼으로 삭제할 수 있습니다.
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "실제 폼에서 파일을 선택할 때의 예시입니다. 여러 개의 이미지 파일을 관리하는 시나리오를 보여줍니다.",
      },
    },
  },
};
