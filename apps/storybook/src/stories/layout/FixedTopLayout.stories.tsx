import { FixedTopLayout } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof FixedTopLayout> = {
  title: "Layout/FixedTopLayout",
  component: FixedTopLayout,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# FixedTopLayout

전역 상태 관리를 통해 상단에 고정된 요소를 보여주는 레이아웃 컴포넌트입니다.

## 사용법

\`\`\`tsx
// app/layout.tsx에서 전역 설정
<FixedTopLayout>
  {children}
</FixedTopLayout>

// 어느 페이지에서든 상단 고정 요소 사용
<FixedTopLayout.Content>
  <div className="w-full bg-blue-500 text-white py-3 px-4">
    <h1>상단 헤더</h1>
  </div>
</FixedTopLayout.Content>
\`\`\`

## Props

| Prop | Type | Description |
|------|------|-------------|
| \`children\` | \`ReactNode\` | 메인 콘텐츠 |

## Content Props

| Prop | Type | Description |
|------|------|-------------|
| \`children\` | \`ReactNode\` | 상단에 표시할 고정 콘텐츠 |

## 특징

- **전역 상태**: Context를 통한 전역 상단 콘텐츠 관리
- **합성 패턴**: \`FixedTopLayout.Content\`로 사용
- **플로팅 UI**: 상단에 카드 형태로 고정
- **자동 관리**: 컴포넌트 언마운트 시 자동 제거`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicHeader: Story = {
  render: () => {
    return (
      <FixedTopLayout>
        <FixedTopLayout.Content>
          <div className="bg-blue-500 p-4 text-white">
            <h1 className="text-lg font-bold">기본 상단 헤더</h1>
          </div>
        </FixedTopLayout.Content>

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
      </FixedTopLayout>
    );
  },
};

export const NavigationHeader: Story = {
  render: () => {
    return (
      <FixedTopLayout>
        <FixedTopLayout.Content>
          <div className="flex items-center justify-between border-b bg-white p-4">
            <button className="text-gray-600 hover:text-gray-900">← 뒤로</button>
            <h1 className="text-lg font-semibold">페이지 제목</h1>
            <button className="text-blue-500 hover:text-blue-700">완료</button>
          </div>
        </FixedTopLayout.Content>

        <div style={{ padding: "2rem", minHeight: "100vh" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            네비게이션 헤더 예시
          </h1>
          <p style={{ marginBottom: "1rem" }}>
            뒤로가기, 제목, 액션 버튼이 있는 네비게이션 헤더 예시입니다.
          </p>
          {Array.from({ length: 15 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - 네비게이션 헤더 레이아웃을 테스트합니다.
            </p>
          ))}
        </div>
      </FixedTopLayout>
    );
  },
};

export const SearchHeader: Story = {
  render: () => {
    return (
      <FixedTopLayout>
        <FixedTopLayout.Content>
          <div className="space-y-3 border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold">검색</h1>
              <button className="text-sm text-gray-500">취소</button>
            </div>
            <div className="flex items-center rounded-lg bg-gray-100 px-3 py-2">
              <svg
                className="mr-2 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>
        </FixedTopLayout.Content>

        <div style={{ padding: "2rem", minHeight: "100vh" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            검색 헤더 예시
          </h1>
          <p style={{ marginBottom: "1rem" }}>
            제목과 검색바가 함께 있는 복합 상단 헤더 예시입니다.
          </p>
          {Array.from({ length: 25 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - 검색 헤더 레이아웃을 테스트합니다.
            </p>
          ))}
        </div>
      </FixedTopLayout>
    );
  },
};
