import type { Meta, StoryObj } from "@storybook/nextjs";
import { LabelText } from "@repo/ui/components";

const meta: Meta<typeof LabelText> = {
  title: "Common/LabelText",
  component: LabelText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# LabelText

입력 필드나 폼 요소의 라벨을 표시하는 컴포넌트입니다. 필수 여부를 시각적으로 표시할 수 있습니다.

## 특징

- **필수 표시**: 빨간색 별표(*)로 필수 입력 필드임을 명확히 표시
  - required가 false: 별표 숨김 (opacity-0)
  - required가 true + disabled가 false: 별표 선명 (opacity-100)
  - required가 true + disabled가 true: 별표 희미 (opacity-15)
- **비활성 상태**: disabled 시 텍스트 색상이 회색으로 변경
- **일관된 스타일**: SubTitle 타이포그래피를 사용하여 통일된 디자인
- **유연한 커스터마이징**: className을 통한 스타일 확장 가능

## 사용법

\`\`\`tsx
// 필수 라벨
<LabelText required={true}>이메일</LabelText>

// 선택적 라벨
<LabelText required={false}>닉네임</LabelText>

// 비활성화된 라벨
<LabelText required={true} disabled>비활성화됨</LabelText>

// 커스텀 스타일
<LabelText required={true} className="text-blue-600">
  파란색 라벨
</LabelText>
\`\`\`

## Props

- **required**: boolean - 필수 여부 (true: 별표 표시, false: 별표 숨김)
- **disabled**: boolean (optional) - 비활성 상태 (회색 텍스트 + 별표 희미)
- **children**: ReactNode - 라벨 텍스트 내용
- **className**: string - 추가 스타일링 클래스
- **...props**: HTMLDivElement 속성들`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    required: {
      control: { type: "boolean" },
      description: "필수 입력 여부 (true: 별표 표시, false: 별표 숨김)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      control: { type: "boolean" },
      description:
        "비활성 상태 (회색 텍스트 + required가 true일 때 별표 희미하게 표시)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    children: {
      control: { type: "text" },
      description: "라벨 텍스트 내용",
      table: {
        type: { summary: "ReactNode" },
      },
    },
    className: {
      control: { type: "text" },
      description: "추가 CSS 클래스",
      table: {
        type: { summary: "string" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 라벨
export const Default: Story = {
  args: {
    children: "라벨 텍스트",
    required: false,
  },
};

// 필수 라벨
export const Required: Story = {
  args: {
    children: "이메일",
    required: true,
  },
};

// 선택적 라벨
export const Optional: Story = {
  args: {
    children: "닉네임",
    required: false,
  },
};

// 비활성화된 라벨
export const Disabled: Story = {
  args: {
    children: "비활성화된 라벨",
    required: true,
    disabled: true,
  },
};

// 모든 변형 표시
export const AllVariations: Story = {
  render: () => (
    <div
      style={{
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        minWidth: "400px",
      }}
    >
      <div>
        <h3
          style={{
            marginBottom: "16px",
            fontSize: "16px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          필수 라벨 (별표 선명)
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <LabelText required={true}>이메일</LabelText>
          <LabelText required={true}>비밀번호</LabelText>
          <LabelText required={true}>이름</LabelText>
        </div>
      </div>

      <div>
        <h3
          style={{
            marginBottom: "16px",
            fontSize: "16px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          선택적 라벨 (별표 숨김)
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <LabelText required={false}>닉네임</LabelText>
          <LabelText required={false}>소개</LabelText>
          <LabelText required={false}>전화번호</LabelText>
        </div>
      </div>

      <div>
        <h3
          style={{
            marginBottom: "16px",
            fontSize: "16px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          비활성화 상태 (회색, 별표 희미)
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <LabelText required={true} disabled>
            비활성화된 필수 라벨
          </LabelText>
          <LabelText required={false} disabled>
            비활성화된 선택적 라벨 (별표 없음)
          </LabelText>
        </div>
      </div>
    </div>
  ),
};

// 커스텀 스타일
export const CustomStyles: Story = {
  render: () => (
    <div
      style={{
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        minWidth: "400px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <LabelText required={true} className="text-blue-600">
          파란색 라벨
        </LabelText>

        <LabelText required={true} className="text-purple-600">
          보라색 라벨
        </LabelText>

        <LabelText required={false} className="text-gray-500">
          회색 라벨
        </LabelText>

        <LabelText required={true} className="text-green-600 text-lg">
          큰 크기 라벨
        </LabelText>

        <LabelText required={true} className="opacity-50">
          불투명도가 적용된 라벨
        </LabelText>

        <LabelText required={true} disabled className="!text-red-300">
          비활성화 + 커스텀 색상
        </LabelText>
      </div>
    </div>
  ),
};

// 상호작용 예시
export const Interactive: Story = {
  render: () => (
    <div
      style={{
        padding: "40px",
        width: "400px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <LabelText
        required={true}
        onClick={() => alert("라벨을 클릭했습니다!")}
        style={{ cursor: "pointer" }}
      >
        클릭 가능한 라벨
      </LabelText>

      <LabelText
        required={false}
        className="hover:text-blue-600 transition-colors cursor-pointer"
      >
        호버 효과가 있는 라벨
      </LabelText>
    </div>
  ),
};

// 다양한 길이의 텍스트
export const TextLengths: Story = {
  render: () => (
    <div
      style={{
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        minWidth: "500px",
      }}
    >
      <LabelText required={true}>짧은 라벨</LabelText>

      <LabelText required={true}>조금 더 긴 라벨 텍스트 예시입니다</LabelText>

      <LabelText required={false}>
        매우 긴 라벨 텍스트의 예시로, 여러 단어가 포함되어 있을 때 어떻게
        표시되는지 확인할 수 있습니다
      </LabelText>
    </div>
  ),
};
