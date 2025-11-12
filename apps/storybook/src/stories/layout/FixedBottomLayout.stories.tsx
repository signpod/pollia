import { FixedBottomLayout, toast } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const meta: Meta<typeof FixedBottomLayout> = {
  title: "Layout/FixedBottomLayout",
  component: FixedBottomLayout,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# FixedBottomLayout

전역 상태 관리를 통해 하단에 고정된 요소를 보여주는 레이아웃 컴포넌트입니다.

## 사용법

\`\`\`tsx
// app/layout.tsx에서 전역 설정
<FixedBottomLayout>
  {children}
</FixedBottomLayout>

// 어느 페이지에서든 하단 고정 요소 사용
<FixedBottomLayout.Content>
  <button className="w-full bg-blue-500 text-white py-3 rounded-lg">
    로그인하기
  </button>
</FixedBottomLayout.Content>
\`\`\`

## Props

| Prop | Type | Description |
|------|------|-------------|
| \`children\` | \`ReactNode\` | 메인 콘텐츠 |

## Content Props

| Prop | Type | Description |
|------|------|-------------|
| \`children\` | \`ReactNode\` | 하단에 표시할 고정 콘텐츠 |

## 특징

- **전역 상태**: Context를 통한 전역 하단 콘텐츠 관리
- **합성 패턴**: \`FixedBottomLayout.Content\`로 사용
- **플로팅 UI**: 하단에 카드 형태로 고정
- **자동 관리**: 컴포넌트 언마운트 시 자동 제거`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicButton: Story = {
  render: () => {
    return (
      <FixedBottomLayout>
        <div style={{ padding: "2rem", minHeight: "100vh" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            메인 콘텐츠
          </h1>
          <p style={{ marginBottom: "1rem" }}>
            이것은 메인 콘텐츠 영역입니다. 스크롤을 내려보세요.
          </p>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - 긴 텍스트로 스크롤을 테스트합니다.
            </p>
          ))}
        </div>

        <FixedBottomLayout.Content>
          <div className="p-4">
            <button
              type="button"
              className="w-full rounded-lg bg-blue-500 py-3 font-medium text-white transition-colors hover:bg-blue-600"
            >
              기본 고정 버튼
            </button>
          </div>
        </FixedBottomLayout.Content>
      </FixedBottomLayout>
    );
  },
};

export const MultipleButtons: Story = {
  render: () => {
    return (
      <FixedBottomLayout>
        <div style={{ padding: "2rem", minHeight: "100vh" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            다중 버튼 예시
          </h1>
          <p style={{ marginBottom: "1rem" }}>여러 버튼이 함께 표시되는 고정 콘텐츠 예시입니다.</p>
          {Array.from({ length: 15 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - 다중 버튼 레이아웃을 테스트합니다.
            </p>
          ))}
        </div>

        <FixedBottomLayout.Content>
          <div className="flex gap-3 p-4">
            <button
              type="button"
              className="flex-1 rounded-lg bg-gray-200 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-green-500 py-3 font-medium text-white transition-colors hover:bg-green-600"
            >
              확인
            </button>
          </div>
        </FixedBottomLayout.Content>
      </FixedBottomLayout>
    );
  },
};

export const ComplexContent: Story = {
  render: () => {
    return (
      <FixedBottomLayout>
        <div style={{ padding: "2rem", minHeight: "100vh" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            복합 고정 콘텐츠 예시
          </h1>
          <p style={{ marginBottom: "1rem" }}>
            텍스트와 버튼이 함께 있는 복잡한 고정 콘텐츠 예시입니다.
          </p>
          {Array.from({ length: 25 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - 복합 고정 레이아웃을 테스트합니다.
            </p>
          ))}
        </div>

        <FixedBottomLayout.Content>
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">총 결제 금액</p>
                <p className="text-sm text-gray-500">배송비 포함</p>
              </div>
              <p className="text-xl font-bold text-gray-900">₩25,000</p>
            </div>
            <button
              type="button"
              className="w-full rounded-lg bg-purple-500 py-3 font-medium text-white transition-colors hover:bg-purple-600"
            >
              결제하기
            </button>
          </div>
        </FixedBottomLayout.Content>
      </FixedBottomLayout>
    );
  },
};

export const ToasterWithFixedBottom: Story = {
  render: () => {
    return (
      <FixedBottomLayout>
        <div style={{ padding: "2rem", minHeight: "100vh" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Toast와 하단 고정 콘텐츠 테스트
          </h1>
          <p style={{ marginBottom: "1rem", color: "#71717a" }}>
            Toast가 하단 고정 콘텐츠 위에 올바르게 표시되는지 테스트합니다.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Toast 테스트 버튼</h2>
            <button
              onClick={() =>
                toast({
                  message: "성공적으로 저장되었습니다!",
                  icon: CheckCircle2,
                  iconClassName: "text-green-500",
                })
              }
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "#22c55e",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
              type="button"
            >
              Success Toast
            </button>
            <button
              onClick={() =>
                toast({
                  message: "주의가 필요합니다.",
                  icon: AlertTriangle,
                  iconClassName: "text-orange-500",
                })
              }
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "#f97316",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
              type="button"
            >
              Warning Toast
            </button>
          </div>

          {Array.from({ length: 15 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - Toast와 고정 콘텐츠의 위치 관계를 테스트합니다.
            </p>
          ))}
        </div>

        <FixedBottomLayout.Content>
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-600">하단 고정 콘텐츠</p>
              <p className="text-sm font-medium text-gray-900">Toast는 이 위에 표시됩니다</p>
            </div>
            <button
              type="button"
              className="w-full rounded-lg bg-indigo-500 py-3 font-medium text-white transition-colors hover:bg-indigo-600"
            >
              하단 고정 버튼
            </button>
          </div>
        </FixedBottomLayout.Content>
      </FixedBottomLayout>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Toast가 하단 고정 콘텐츠(FixedBottomLayout.Content)와 함께 사용될 때 올바르게 렌더링되는지 테스트합니다. Toast는 고정 콘텐츠 위에 표시되어야 합니다.",
      },
    },
  },
};

export const ToasterWithoutFixedBottom: Story = {
  render: () => {
    return (
      <FixedBottomLayout>
        <div style={{ padding: "2rem", minHeight: "100vh" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Toast 단독 테스트 (하단 고정 콘텐츠 없음)
          </h1>
          <p style={{ marginBottom: "1rem", color: "#71717a" }}>
            하단 고정 콘텐츠 없이 Toast만 사용할 때의 동작을 테스트합니다.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Toast 테스트 버튼</h2>
            <button
              onClick={() =>
                toast({
                  message: "성공적으로 저장되었습니다!",
                  icon: CheckCircle2,
                  iconClassName: "text-green-500",
                })
              }
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "#22c55e",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
              type="button"
            >
              Success Toast
            </button>
            <button
              onClick={() =>
                toast({
                  message: "주의가 필요합니다.",
                  icon: AlertTriangle,
                  iconClassName: "text-orange-500",
                })
              }
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "#f97316",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
              type="button"
            >
              Warning Toast
            </button>
            <button
              onClick={() => {
                toast({
                  message: "첫 번째",
                  icon: CheckCircle2,
                  iconClassName: "text-green-500",
                });
                setTimeout(
                  () =>
                    toast({
                      message: "두 번째",
                    }),
                  500,
                );
                setTimeout(
                  () =>
                    toast({
                      message: "세 번째",
                      icon: AlertTriangle,
                      iconClassName: "text-orange-500",
                    }),
                  1000,
                );
                setTimeout(
                  () =>
                    toast({
                      message: "네 번째",
                    }),
                  1500,
                );
              }}
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "#8b5cf6",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
              type="button"
            >
              Multiple Toasts (Queue 테스트)
            </button>
          </div>

          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - 하단 고정 콘텐츠 없이 Toast만 사용하는 케이스를 테스트합니다.
            </p>
          ))}
        </div>

        {/* FixedBottomLayout.Content 없음 - contentHeight가 0인 상태 */}
      </FixedBottomLayout>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "하단 고정 콘텐츠(FixedBottomLayout.Content)가 없을 때 Toast가 올바르게 렌더링되는지 테스트합니다. Toast는 화면 하단(offset 20px)에 표시되어야 합니다. contentHeight가 0일 때의 동작을 확인할 수 있습니다.",
      },
    },
  },
};
