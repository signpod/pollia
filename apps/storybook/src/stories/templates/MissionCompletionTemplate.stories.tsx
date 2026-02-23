import { ProfileHeaderView } from "@/components/common/ProfileHeaderView";
import { MissionCompletionTemplate } from "@/components/common/templates/MissionCompletionTemplate";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useRef, useState } from "react";

const meta: Meta<typeof MissionCompletionTemplate> = {
  title: "Templates/MissionCompletionTemplate",
  component: MissionCompletionTemplate,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# MissionCompletionTemplate

미션 완료 화면의 mainContent 영역을 담당하는 Template 컴포넌트입니다.

## 구성 요소

- 헤더 (ProfileHeaderView, 외부에서 주입)
- 완료 이미지 (선택)
- 이미지 메뉴 (저장/공유)
- 완료 메시지 (제목 + 설명)
- 미션 공유 버튼

## Props

| Prop | Type | Description |
|------|------|-------------|
| header | ReactNode | 상단 헤더 (ProfileHeaderView 등) |
| imageUrl | string | 완료 이미지 URL |
| title | string | 완료 메시지 제목 |
| description | string | 완료 메시지 설명 (HTML) |
| imageMenu | object | 이미지 메뉴 상태 및 핸들러 |
| onShare | function | 미션 공유 버튼 클릭 핸들러 |

## 사용처

- MissionCompletionPage의 mainContent 영역
- 모달, 프리뷰 등에서 단독 사용 가능
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_IMAGE = "https://picsum.photos/800/600";
const SAMPLE_IMAGE_PORTRAIT = "https://picsum.photos/600/900";
const SAMPLE_TITLE = "미션을 완료했어요!";
const SAMPLE_DESCRIPTION = "<p>축하합니다! 미션을 성공적으로 완료했습니다.</p>";

const MOCK_USER = { name: "테스터" };
const MOCK_PROFILE_IMAGE = null;

function MockHeader() {
  return <ProfileHeaderView user={MOCK_USER} profileImageUrl={MOCK_PROFILE_IMAGE} />;
}

function ImageMenuWrapper({
  imageUrl,
  title,
  description,
  onShare,
}: {
  imageUrl?: string;
  title?: string;
  description?: string;
  onShare?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white">
      <MissionCompletionTemplate
        header={<MockHeader />}
        imageUrl={imageUrl}
        title={title}
        description={description}
        imageMenu={{
          isOpen,
          menuRef,
          onToggle: () => setIsOpen(!isOpen),
          onSave: () => {
            alert("이미지 저장");
            setIsOpen(false);
          },
          onShare: () => {
            alert("이미지 공유");
            setIsOpen(false);
          },
        }}
        onShare={onShare}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <ImageMenuWrapper
      imageUrl={SAMPLE_IMAGE}
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
      onShare={() => alert("미션 공유")}
    />
  ),
};

export const WithPortraitImage: Story = {
  render: () => (
    <ImageMenuWrapper
      imageUrl={SAMPLE_IMAGE_PORTRAIT}
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
      onShare={() => alert("미션 공유")}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "2:3 비율 세로 이미지 (권장 사이즈)가 있는 Template입니다.",
      },
    },
  },
};

export const WithoutImage: Story = {
  render: () => (
    <ImageMenuWrapper
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
      onShare={() => alert("미션 공유")}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "이미지가 없는 Template입니다.",
      },
    },
  },
};

export const LongDescription: Story = {
  render: () => (
    <ImageMenuWrapper
      imageUrl={SAMPLE_IMAGE}
      title="축하합니다!"
      description={`
        <p>미션을 성공적으로 완료하셨습니다.</p>
        <p>이번 미션을 통해 새로운 경험을 하셨기를 바랍니다.</p>
        <p>앞으로도 다양한 미션에 참여해 주세요!</p>
        <p><strong>감사합니다.</strong></p>
      `}
      onShare={() => alert("미션 공유")}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "긴 설명 텍스트가 있는 Template입니다.",
      },
    },
  },
};

export const ImageMenuOpen: Story = {
  render: () => {
    const menuRef = useRef<HTMLDivElement>(null);

    return (
      <div className="bg-white">
        <MissionCompletionTemplate
          header={<MockHeader />}
          imageUrl={SAMPLE_IMAGE}
          title={SAMPLE_TITLE}
          description={SAMPLE_DESCRIPTION}
          imageMenu={{
            isOpen: true,
            menuRef,
            onToggle: () => {},
            onSave: () => alert("이미지 저장"),
            onShare: () => alert("이미지 공유"),
          }}
          onShare={() => alert("미션 공유")}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "이미지 메뉴가 열려있는 상태입니다.",
      },
    },
  },
};

export const TitleOnly: Story = {
  render: () => (
    <ImageMenuWrapper
      imageUrl={SAMPLE_IMAGE}
      title={SAMPLE_TITLE}
      onShare={() => alert("미션 공유")}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "제목만 있고 설명이 없는 Template입니다.",
      },
    },
  },
};

export const WithoutShareButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    return (
      <div className="bg-white">
        <MissionCompletionTemplate
          header={<MockHeader />}
          imageUrl={SAMPLE_IMAGE}
          title={SAMPLE_TITLE}
          description={SAMPLE_DESCRIPTION}
          imageMenu={{
            isOpen,
            menuRef,
            onToggle: () => setIsOpen(!isOpen),
            onSave: () => {
              alert("이미지 저장");
              setIsOpen(false);
            },
            onShare: () => {
              alert("이미지 공유");
              setIsOpen(false);
            },
          }}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "공유 버튼이 없는 Template입니다. onShare prop이 없으면 버튼이 표시되지 않습니다.",
      },
    },
  },
};

export const WithoutHeader: Story = {
  render: () => (
    <div className="bg-white">
      <MissionCompletionTemplate
        imageUrl={SAMPLE_IMAGE}
        title={SAMPLE_TITLE}
        description={SAMPLE_DESCRIPTION}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "헤더가 없는 Template입니다. header prop을 전달하지 않으면 헤더가 표시되지 않습니다.",
      },
    },
  },
};
