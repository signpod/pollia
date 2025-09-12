import type { Meta, StoryObj } from "@storybook/nextjs";
import { Typo } from "@repo/ui/components";

const meta: Meta<typeof Typo.MainTitle> = {
  title: "Common/Typo",
  component: Typo.MainTitle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# Typo

타이포그래피 시스템을 위한 합성 컴포넌트입니다. 일관된 텍스트 스타일링을 제공합니다.

## 구성 요소

- **MainTitle**: 주 제목용 (Medium: 24px, Small: 20px)
- **SubTitle**: 부 제목용 (Large: 16px)
- **Body**: 본문용 (Large: 16px, Medium: 14px, Small: 12px)
- **ButtonText**: 버튼 텍스트용 (Large: 16px, Medium: 14px)

## 사용법

\`\`\`tsx
// Main Title
<Typo.MainTitle size="medium">메인 제목</Typo.MainTitle>
<Typo.MainTitle size="small">작은 메인 제목</Typo.MainTitle>

// Sub Title
<Typo.SubTitle size="large">서브 제목</Typo.SubTitle>

// Body Text
<Typo.Body size="large">큰 본문</Typo.Body>
<Typo.Body size="medium">중간 본문</Typo.Body>
<Typo.Body size="small">작은 본문</Typo.Body>

// Button Text
<Typo.ButtonText size="large">버튼 텍스트</Typo.ButtonText>
\`\`\`

## 스타일 규격

| Type | Size | Font Size | Weight | Line Height |
|------|------|-----------|---------|-------------|
| MainTitle | medium | 24px | Bold | 150% |
| MainTitle | small | 20px | Bold | 150% |
| SubTitle | large | 16px | Bold | 150% |
| Body | large | 16px | Medium | 150% |
| Body | medium | 14px | Semibold | 150% |
| Body | small | 12px | Medium | 150% |
| ButtonText | large | 16px | Bold | 150% |
| ButtonText | medium | 14px | Bold | 150% |

## Props

모든 컴포넌트는 다음을 지원합니다:
- **size**: 허용된 크기 변형
- **className**: 추가 스타일링 클래스
- **children**: 텍스트 내용
- HTML 속성들 (onClick, style 등)`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTypes: Story = {
  render: () => (
    <div
      style={{
        padding: "50px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        maxWidth: "800px",
      }}
    >
      <div>
        <h3
          style={{
            marginBottom: "16px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          Main Title
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Typo.MainTitle size="medium">메인 제목 Medium (24px)</Typo.MainTitle>
          <Typo.MainTitle size="small">메인 제목 Small (20px)</Typo.MainTitle>
        </div>
      </div>

      <div>
        <h3
          style={{
            marginBottom: "16px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          Sub Title
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Typo.SubTitle size="large">서브 제목 Large (16px)</Typo.SubTitle>
        </div>
      </div>

      <div>
        <h3
          style={{
            marginBottom: "16px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          Body Text
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Typo.Body size="large">
            본문 텍스트 Large (16px) - 중요한 본문이나 강조할 내용에 사용합니다.
          </Typo.Body>
          <Typo.Body size="medium">
            본문 텍스트 Medium (14px) - 일반적인 본문 텍스트로 가장 많이
            사용됩니다.
          </Typo.Body>
          <Typo.Body size="small">
            본문 텍스트 Small (12px) - 부가 설명이나 작은 텍스트에 사용합니다.
          </Typo.Body>
        </div>
      </div>

      <div>
        <h3
          style={{
            marginBottom: "16px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          Button Text
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Typo.ButtonText size="large">
            버튼 텍스트 Large (16px)
          </Typo.ButtonText>
          <Typo.ButtonText size="medium">
            버튼 텍스트 Medium (14px)
          </Typo.ButtonText>
        </div>
      </div>
    </div>
  ),
};

export const MainTitles: Story = {
  render: () => (
    <div
      style={{
        padding: "50px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "600px",
      }}
    >
      <Typo.MainTitle size="medium">
        새로운 프로젝트를 시작해보세요
      </Typo.MainTitle>
      <Typo.MainTitle size="small">더 작은 메인 제목입니다</Typo.MainTitle>
      <Typo.MainTitle size="medium" className="text-blue-600">
        색상을 변경한 메인 제목
      </Typo.MainTitle>
    </div>
  ),
};

export const BodyVariations: Story = {
  render: () => (
    <div
      style={{
        padding: "50px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        maxWidth: "700px",
      }}
    >
      <Typo.Body size="large">
        이것은 큰 본문 텍스트입니다. 중요한 정보나 강조하고 싶은 내용을 표시할
        때 사용합니다. 16px 크기에 Medium 폰트 웨이트를 가지고 있어 적절한
        가독성을 제공합니다.
      </Typo.Body>

      <Typo.Body size="medium">
        이것은 중간 크기의 본문 텍스트입니다. 가장 일반적으로 사용되는 텍스트
        크기로, 대부분의 본문 내용에 적합합니다. 14px 크기에 Semibold 웨이트를
        사용합니다.
      </Typo.Body>

      <Typo.Body size="small">
        이것은 작은 본문 텍스트입니다. 부가 정보, 설명, 또는 덜 중요한 내용을
        표시할 때 사용합니다. 12px 크기에 Medium 웨이트로 깔끔한 느낌을 줍니다.
      </Typo.Body>

      <Typo.Body size="medium" className="text-gray-500">
        회색으로 표시된 중간 크기 텍스트
      </Typo.Body>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div
      style={{
        padding: "50px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "500px",
      }}
    >
      <Typo.MainTitle
        size="medium"
        onClick={() => alert("Main Title 클릭!")}
        style={{ cursor: "pointer", color: "#3B82F6" }}
      >
        클릭 가능한 메인 제목
      </Typo.MainTitle>

      <Typo.SubTitle
        size="large"
        className="hover:text-purple-600 transition-colors cursor-pointer"
      >
        호버 효과가 있는 서브 제목
      </Typo.SubTitle>

      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <button
          style={{
            padding: "12px 24px",
            backgroundColor: "#10B981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <Typo.ButtonText size="large">확인</Typo.ButtonText>
        </button>

        <button
          style={{
            padding: "12px 24px",
            backgroundColor: "transparent",
            color: "#6B7280",
            border: "2px solid #D1D5DB",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <Typo.ButtonText size="large">취소</Typo.ButtonText>
        </button>
      </div>

      <Typo.Body size="small" className="text-gray-400">
        * 위의 요소들과 상호작용해보세요
      </Typo.Body>
    </div>
  ),
};

export const ColorVariations: Story = {
  render: () => (
    <div
      style={{
        padding: "50px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "600px",
      }}
    >
      <Typo.MainTitle size="medium" className="text-slate-900">
        기본 검정색 메인 제목
      </Typo.MainTitle>

      <Typo.MainTitle size="medium" className="text-blue-600">
        파란색 메인 제목
      </Typo.MainTitle>

      <Typo.MainTitle size="medium" className="text-red-600">
        빨간색 메인 제목
      </Typo.MainTitle>

      <Typo.SubTitle size="large" className="text-purple-600">
        보라색 서브 제목
      </Typo.SubTitle>

      <Typo.Body size="large" className="text-green-700">
        초록색 본문 텍스트
      </Typo.Body>

      <Typo.Body size="medium" className="text-gray-500">
        회색 본문 텍스트
      </Typo.Body>

      <div
        style={{
          backgroundColor: "#1F2937",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <Typo.MainTitle size="small" className="text-white mb-3">
          어두운 배경의 흰색 제목
        </Typo.MainTitle>
        <Typo.Body size="medium" className="text-gray-300">
          어두운 배경의 밝은 회색 본문
        </Typo.Body>
      </div>
    </div>
  ),
};
