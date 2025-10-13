import type { Meta, StoryObj } from "@storybook/nextjs";
import { FloatingLayout } from "@repo/ui/components";

const meta: Meta<typeof FloatingLayout> = {
  title: "Layout/FloatingLayout",
  component: FloatingLayout,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# FloatingLayout

Context와 Fixed Positioning을 활용하여 화면에 고정 배치 가능한 Floating 레이아웃 컴포넌트입니다.

## 사용법

\`\`\`tsx
// app/layout.tsx에서 전역 설정
<FloatingLayout>
  {children}
</FloatingLayout>

// 어느 페이지에서든 Floating 요소 사용
<FloatingLayout.Content position={{ bottom: 20, right: 20 }}>
  <button className="w-14 h-14 rounded-full bg-purple-600 text-white">
    +
  </button>
</FloatingLayout.Content>
\`\`\`

## Props

| Prop | Type | Description |
|------|------|-------------|
| \`children\` | \`ReactNode\` | 메인 콘텐츠 |

## Content Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`children\` | \`ReactNode\` | - | Floating으로 표시할 콘텐츠 |
| \`position\` | \`FloatingPosition\` | \`{ bottom: 20, right: 20 }\` | 위치 설정 (top, bottom, left, right) |
| \`className\` | \`string\` | \`""\` | 추가 스타일 클래스 |

## 특징

- **전역 상태**: Context를 통한 전역 Floating 콘텐츠 관리
- **Fixed Positioning**: 스크롤해도 화면에 고정되어 항상 같은 위치 유지
- **자유로운 위치**: top, bottom, left, right로 위치 지정
- **적절한 z-index**: z-30으로 일반 콘텐츠보다 높고 모달보다 낮음
- **애니메이션 지원**: transition 효과 내장
- **자동 관리**: 컴포넌트 언마운트 시 자동 제거`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FloatingActionButton: Story = {
  render: () => {
    return (
      <FloatingLayout>
        <div style={{ padding: "2rem", minHeight: "100vh" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Floating Action Button 예시
          </h1>
          <p style={{ marginBottom: "1rem" }}>
            오른쪽 하단에 고정된 Floating Action Button이 표시됩니다.
          </p>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - FAB 레이아웃을 테스트합니다.
            </p>
          ))}
        </div>

        <FloatingLayout.Content position={{ bottom: 20, right: 20 }}>
          <button className="w-14 h-14 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </FloatingLayout.Content>
      </FloatingLayout>
    );
  },
};

export const NotificationCard: Story = {
  render: () => {
    return (
      <FloatingLayout>
        <div style={{ padding: "2rem", minHeight: "100vh" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            알림 카드 예시
          </h1>
          <p style={{ marginBottom: "1rem" }}>
            왼쪽 상단에 알림 카드가 Floating 형태로 표시됩니다.
          </p>
          {Array.from({ length: 15 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - 알림 카드 레이아웃을 테스트합니다.
            </p>
          ))}
        </div>

        <FloatingLayout.Content
          position={{ top: 20, left: 20 }}
          className="bg-white rounded-lg shadow-lg p-4 border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">새로운 알림</p>
              <p className="text-xs text-gray-600">메시지가 도착했습니다.</p>
            </div>
          </div>
        </FloatingLayout.Content>
      </FloatingLayout>
    );
  },
};

export const ToastMessage: Story = {
  render: () => {
    return (
      <FloatingLayout>
        <div style={{ padding: "2rem", minHeight: "100vh" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Toast 메시지 예시
          </h1>
          <p style={{ marginBottom: "1rem" }}>
            하단 중앙에 Toast 메시지가 표시됩니다.
          </p>
          {Array.from({ length: 25 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - Toast 메시지 레이아웃을 테스트합니다.
            </p>
          ))}
        </div>

        <FloatingLayout.Content
          position={{ bottom: 20, left: "50%", right: "auto" }}
          className="bg-gray-900 text-white rounded-lg shadow-lg px-6 py-3 -translate-x-1/2"
        >
          <p className="text-sm font-medium">저장되었습니다 ✓</p>
        </FloatingLayout.Content>
      </FloatingLayout>
    );
  },
};

export const MultipleElements: Story = {
  render: () => {
    return (
      <FloatingLayout>
        <div style={{ padding: "2rem", minHeight: "100vh" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            여러 Floating 요소 함께 사용
          </h1>
          <p style={{ marginBottom: "1rem" }}>
            FAB와 도움말 버튼이 함께 표시됩니다. 스크롤을 내려보세요.
          </p>
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - 다중 Floating 요소 레이아웃을 테스트합니다.
            </p>
          ))}
        </div>

        <FloatingLayout.Content position={{ bottom: 20, right: 20 }}>
          <button className="w-14 h-14 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </FloatingLayout.Content>

        <FloatingLayout.Content
          position={{ bottom: 20, left: 20 }}
          className="bg-white rounded-full shadow-lg"
        >
          <button className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </button>
        </FloatingLayout.Content>
      </FloatingLayout>
    );
  },
};
