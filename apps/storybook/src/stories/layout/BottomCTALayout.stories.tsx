import type { Meta, StoryObj } from "@storybook/nextjs";
import { BottomCTALayout } from "@repo/ui/components";

const meta: Meta<typeof BottomCTALayout> = {
  title: "Layout/BottomCTALayout",
  component: BottomCTALayout,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# BottomCTALayout

전역 상태 관리를 통해 하단에 플로팅 CTA를 보여주는 레이아웃 컴포넌트입니다.

## 사용법

\`\`\`tsx
// app/layout.tsx에서 전역 설정
<BottomCTALayout>
  {children}
</BottomCTALayout>

// 어느 페이지에서든 CTA 사용
<BottomCTALayout.CTA>
  <button className="w-full bg-blue-500 text-white py-3 rounded-lg">
    로그인하기
  </button>
</BottomCTALayout.CTA>
\`\`\`

## Props

| Prop | Type | Description |
|------|------|-------------|
| \`children\` | \`ReactNode\` | 메인 콘텐츠 |

## CTA Props

| Prop | Type | Description |
|------|------|-------------|
| \`children\` | \`ReactNode\` | 하단에 표시할 CTA 내용 |

## 특징

- **전역 상태**: Context를 통한 전역 CTA 관리
- **합성 패턴**: \`BottomCTALayout.CTA\`로 사용
- **플로팅 UI**: 하단에 카드 형태로 플로팅
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
      <BottomCTALayout>
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

        <BottomCTALayout.CTA>
          <div className="p-4">
            <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
              기본 CTA 버튼
            </button>
          </div>
        </BottomCTALayout.CTA>
      </BottomCTALayout>
    );
  },
};

export const MultipleButtons: Story = {
  render: () => {
    return (
      <BottomCTALayout>
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
          <p style={{ marginBottom: "1rem" }}>
            여러 버튼이 함께 표시되는 CTA 예시입니다.
          </p>
          {Array.from({ length: 15 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - 다중 버튼 레이아웃을 테스트합니다.
            </p>
          ))}
        </div>

        <BottomCTALayout.CTA>
          <div className="flex gap-3 p-4">
            <button className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
              취소
            </button>
            <button className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors">
              확인
            </button>
          </div>
        </BottomCTALayout.CTA>
      </BottomCTALayout>
    );
  },
};

export const ComplexCTA: Story = {
  render: () => {
    return (
      <BottomCTALayout>
        <div style={{ padding: "2rem", minHeight: "100vh" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            복합 CTA 예시
          </h1>
          <p style={{ marginBottom: "1rem" }}>
            텍스트와 버튼이 함께 있는 복잡한 CTA 예시입니다.
          </p>
          {Array.from({ length: 25 }, (_, i) => (
            <p key={i} style={{ marginBottom: "1rem" }}>
              콘텐츠 라인 {i + 1} - 복합 CTA 레이아웃을 테스트합니다.
            </p>
          ))}
        </div>

        <BottomCTALayout.CTA>
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">총 결제 금액</p>
                <p className="text-sm text-gray-500">배송비 포함</p>
              </div>
              <p className="text-xl font-bold text-gray-900">₩25,000</p>
            </div>
            <button className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 transition-colors">
              결제하기
            </button>
          </div>
        </BottomCTALayout.CTA>
      </BottomCTALayout>
    );
  },
};
