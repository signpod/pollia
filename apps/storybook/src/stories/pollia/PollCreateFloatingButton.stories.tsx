import { Meta, StoryObj } from "@storybook/nextjs";
import PollCreateFloatingButton from "@web/components/poll/PollCreateFloatingButton";
import { FloatingLayout } from "@repo/ui/components";

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

// 실제 사용 예시 - FloatingLayout과 함께
export const InFloatingLayout: Story = {
  render: () => {
    return (
      <FloatingLayout>
        <div style={{ width: "375px", height: "667px", padding: "2rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            투표 목록
          </h1>
          <p style={{ color: "#71717a", marginBottom: "1rem" }}>
            오른쪽 하단의 버튼을 눌러 새 투표를 만들어보세요.
          </p>
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              style={{
                padding: "1rem",
                marginBottom: "0.5rem",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
              }}
            >
              투표 항목 {i + 1}
            </div>
          ))}
        </div>

        <FloatingLayout.Content position={{ bottom: 20, right: 20 }}>
          <PollCreateFloatingButton
            variant="icon-only"
            onClick={() => alert("투표 만들기 클릭!")}
          />
        </FloatingLayout.Content>
      </FloatingLayout>
    );
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "FloatingLayout과 함께 사용하는 실제 예시입니다. 화면 오른쪽 하단에 고정되어 표시됩니다.",
      },
    },
  },
};

// 텍스트 버전 - FloatingLayout과 함께
export const WithTextInFloatingLayout: Story = {
  render: () => {
    return (
      <FloatingLayout>
        <div style={{ width: "375px", height: "667px", padding: "2rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            투표 목록
          </h1>
          <p style={{ color: "#71717a", marginBottom: "1rem" }}>
            텍스트가 포함된 버튼으로 명확한 액션을 안내합니다.
          </p>
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              style={{
                padding: "1rem",
                marginBottom: "0.5rem",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
              }}
            >
              투표 항목 {i + 1}
            </div>
          ))}
        </div>

        <FloatingLayout.Content position={{ bottom: 20, right: 20 }}>
          <PollCreateFloatingButton
            variant="with-text"
            onClick={() => alert("투표 만들기 클릭!")}
          />
        </FloatingLayout.Content>
      </FloatingLayout>
    );
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "텍스트가 포함된 버전의 실제 사용 예시입니다. 첫 방문 사용자나 명확한 안내가 필요한 경우에 적합합니다.",
      },
    },
  },
};

// 다양한 위치 예시
export const DifferentPositions: Story = {
  render: () => {
    return (
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: "200px", height: "200px" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "2px dashed #e4e4e7",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a1a1aa",
            }}
          >
            오른쪽 하단
          </div>
          <div style={{ position: "absolute", bottom: "12px", right: "12px" }}>
            <PollCreateFloatingButton variant="icon-only" />
          </div>
        </div>

        <div style={{ position: "relative", width: "200px", height: "200px" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "2px dashed #e4e4e7",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a1a1aa",
            }}
          >
            하단 중앙
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <PollCreateFloatingButton variant="with-text" />
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "다양한 위치에 배치된 버튼 예시입니다.",
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
