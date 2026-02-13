import { MissionCompletionPage } from "@/components/common/pages/MissionCompletionPage";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useRef, useState } from "react";

const meta: Meta<typeof MissionCompletionPage> = {
  title: "Pages/MissionCompletionPage",
  component: MissionCompletionPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# MissionCompletionPage

미션 완료 화면 페이지 컴포넌트입니다.

## 구성 요소

- 완료 이미지 (선택)
- 이미지 메뉴 (저장/공유)
- 완료 메시지 (제목 + 설명)
- 미션 공유 버튼
- 하단 고정 링크 버튼 (FixedBottomLayout)

## Props

| Prop | Type | Description |
|------|------|-------------|
| imageUrl | string | 완료 이미지 URL |
| title | string | 완료 메시지 제목 |
| description | string | 완료 메시지 설명 (HTML) |
| links | Record<string, string> | 하단 링크 버튼 (key: 텍스트, value: URL) |
| imageMenu | object | 이미지 메뉴 상태 및 핸들러 |
| onShare | function | 미션 공유 버튼 클릭 핸들러 |
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

function ImageMenuWrapper({
  imageUrl,
  title,
  description,
  links,
  onShare,
}: {
  imageUrl?: string;
  title?: string;
  description?: string;
  links?: Record<string, string>;
  onShare?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <MissionCompletionPage
      imageUrl={imageUrl}
      title={title}
      description={description}
      links={links}
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

export const WithLinks: Story = {
  render: () => (
    <ImageMenuWrapper
      imageUrl={SAMPLE_IMAGE}
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
      links={{
        홈으로: "https://example.com",
        "다른 미션": "https://example.com/missions",
      }}
      onShare={() => alert("미션 공유")}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "하단에 링크 버튼이 있는 완료 화면입니다.",
      },
    },
  },
};

export const WithLongLinkKeys: Story = {
  render: () => (
    <ImageMenuWrapper
      imageUrl={SAMPLE_IMAGE}
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
      links={{
        "인스타그램 팔로우하기": "https://instagram.com",
        "카카오톡 채널 추가하기": "https://pf.kakao.com",
      }}
      onShare={() => alert("미션 공유")}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "링크 키가 10자 이상일 경우 버튼이 세로로 배치됩니다.",
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
        story: "이미지가 없는 완료 화면입니다.",
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
      links={{
        홈으로: "https://example.com",
      }}
      onShare={() => alert("미션 공유")}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "긴 설명 텍스트가 있는 완료 화면입니다.",
      },
    },
  },
};

export const ImageMenuOpen: Story = {
  render: () => {
    const menuRef = useRef<HTMLDivElement>(null);

    return (
      <MissionCompletionPage
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

export const MultipleLinks: Story = {
  render: () => (
    <ImageMenuWrapper
      imageUrl={SAMPLE_IMAGE}
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
      links={{
        홈으로: "https://example.com",
        프로필: "https://example.com/profile",
      }}
      onShare={() => alert("미션 공유")}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "여러 개의 링크 버튼이 있는 완료 화면입니다.",
      },
    },
  },
};

export const PortraitImage: Story = {
  render: () => (
    <ImageMenuWrapper
      imageUrl={SAMPLE_IMAGE_PORTRAIT}
      title={SAMPLE_TITLE}
      description={SAMPLE_DESCRIPTION}
      links={{
        홈으로: "https://example.com",
      }}
      onShare={() => alert("미션 공유")}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "2:3 비율 세로 이미지 (권장 사이즈)가 있는 완료 화면입니다.",
      },
    },
  },
};
