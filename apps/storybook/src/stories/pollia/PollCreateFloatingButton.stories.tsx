import { Meta, StoryObj } from "@storybook/nextjs";
import PollCreateFloatingButton from "@web/components/poll/PollCreateFloatingButton";
import React from "react";

const meta: Meta<typeof PollCreateFloatingButton> = {
  title: "Pollia/PollCreateFloatingButton",
  component: PollCreateFloatingButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# PollCreateFloatingButton

투표 생성을 위한 Floating Action Button 컴포넌트입니다.

## Variants

- **icon-only**: 아이콘만 표시되는 원형 버튼
- **with-text**: 아이콘과 "투표 만들기" 텍스트가 함께 표시되는 버튼

## 사용법

\`\`\`tsx
// 아이콘만
<PollCreateFloatingButton variant="icon-only" onClick={handleCreate} />

// 텍스트 포함
<PollCreateFloatingButton variant="with-text" onClick={handleCreate} />
\`\`\``,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["icon-only", "with-text"],
      description: "버튼 변형 타입",
    },
    onClick: {
      action: "clicked",
      description: "클릭 이벤트 핸들러",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 아이콘만 표시
export const IconOnly: Story = {
  args: {
    variant: "icon-only",
  },
  parameters: {
    docs: {
      description: {
        story:
          "아이콘만 표시되는 원형 FAB입니다. 공간이 제한적이거나 미니멀한 디자인이 필요할 때 사용합니다.",
      },
    },
  },
};

// 텍스트 포함
export const WithText: Story = {
  args: {
    variant: "with-text",
  },
  parameters: {
    docs: {
      description: {
        story:
          '아이콘과 "투표 만들기" 텍스트가 함께 표시됩니다. 사용자에게 명확한 액션을 안내할 때 사용합니다.',
      },
    },
  },
};

// 상태별 비교
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <PollCreateFloatingButton variant="icon-only" />
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.875rem",
            color: "#71717a",
          }}
        >
          아이콘만
        </p>
      </div>
      <div style={{ textAlign: "center" }}>
        <PollCreateFloatingButton variant="with-text" />
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.875rem",
            color: "#71717a",
          }}
        >
          텍스트 포함
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "두 가지 variant를 한 번에 비교할 수 있습니다.",
      },
    },
  },
};

// 애니메이션 전환 예시
export const AnimationTransition: Story = {
  render: () => {
    const [variant, setVariant] = React.useState<"icon-only" | "with-text">(
      "with-text"
    );

    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: "2rem" }}>
          <PollCreateFloatingButton variant={variant} />
        </div>

        <button
          onClick={() =>
            setVariant(variant === "icon-only" ? "with-text" : "icon-only")
          }
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "1px solid #e4e4e7",
            background: "white",
            cursor: "pointer",
          }}
        >
          전환하기 ({variant === "icon-only" ? "텍스트 표시" : "아이콘만"})
        </button>

        <p
          style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#71717a" }}
        >
          버튼을 클릭하여 애니메이션 전환을 확인하세요
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "버튼을 클릭하여 icon-only와 with-text 간의 부드러운 애니메이션 전환을 확인할 수 있습니다. 실제 스크롤 동작과 동일한 애니메이션이 적용됩니다.",
      },
    },
  },
};
