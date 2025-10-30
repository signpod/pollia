import type { Meta, StoryObj } from "@storybook/nextjs";
import { Tab, Typo } from "@repo/ui/components";
import React from "react";

const meta: Meta<typeof Tab.Root> = {
  title: "Common/Tab",
  component: Tab.Root,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# Tab

웹 접근성을 완벽히 갖춘 Tab 컴포넌트입니다. (Radix UI 기반)

## 접근성 기능
- **ARIA 속성**: role="tablist", role="tab", aria-selected 자동 적용
- **키보드 네비게이션**:
  - ArrowLeft, ArrowRight: 탭 간 이동
  - Home: 첫 번째 탭으로 이동
  - End: 마지막 탭으로 이동
- **포커스 관리**: 자동 포커스 및 활성화
- **스크린 리더 지원**: 완벽한 스크린 리더 호환 (WCAG 2.1 준수)

## 애니메이션
- Framer Motion을 사용한 부드러운 인디케이터 애니메이션
- Spring 애니메이션으로 자연스러운 전환

## 기술 스택
- Radix UI Tabs (WCAG 2.1 준수)
- Framer Motion
- Class Variance Authority
- Tailwind CSS

## 사용법
\`\`\`tsx
<Tab.Root initialTab="tab1">
  <Tab.List>
    <Tab.Item value="tab1">탭 1</Tab.Item>
    <Tab.Item value="tab2">탭 2</Tab.Item>
  </Tab.List>
  <Tab.Content value="tab1">콘텐츠 1</Tab.Content>
  <Tab.Content value="tab2">콘텐츠 2</Tab.Content>
</Tab.Root>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    initialTab: {
      control: { type: "text" },
      description: "초기 활성 탭의 value",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 Tab
export const Default: Story = {
  render: () => (
    <div className="w-[400px]">
      <Tab.Root initialTab="tab1">
        <Tab.List>
          <Tab.Item value="tab1">
            <Typo.SubTitle size="large">탭 1</Typo.SubTitle>
          </Tab.Item>
          <Tab.Item value="tab2">
            <Typo.SubTitle size="large">탭 2</Typo.SubTitle>
          </Tab.Item>
          <Tab.Item value="tab3">
            <Typo.SubTitle size="large">탭 3</Typo.SubTitle>
          </Tab.Item>
        </Tab.List>
      </Tab.Root>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "가장 기본적인 Tab 컴포넌트입니다. 첫 번째 탭이 기본으로 활성화되어 있습니다.",
      },
    },
  },
};

// Content와 함께 사용
export const WithContent: Story = {
  render: () => (
    <div className="w-[500px]">
      <Tab.Root initialTab="profile">
        <Tab.List>
          <Tab.Item value="profile">
            <Typo.SubTitle size="large">프로필</Typo.SubTitle>
          </Tab.Item>
          <Tab.Item value="settings">
            <Typo.SubTitle size="large">설정</Typo.SubTitle>
          </Tab.Item>
          <Tab.Item value="notifications">
            <Typo.SubTitle size="large">알림</Typo.SubTitle>
          </Tab.Item>
        </Tab.List>

        <Tab.Content value="profile">
          <div className="p-4 bg-gray-50 rounded-lg">
            <Typo.Body size="large" className="font-semibold mb-2">
              프로필 정보
            </Typo.Body>
            <Typo.Body size="medium" className="text-gray-600">
              사용자의 프로필 정보를 확인하고 수정할 수 있습니다.
            </Typo.Body>
          </div>
        </Tab.Content>

        <Tab.Content value="settings">
          <div className="p-4 bg-gray-50 rounded-lg">
            <Typo.Body size="large" className="font-semibold mb-2">
              설정
            </Typo.Body>
            <Typo.Body size="medium" className="text-gray-600">
              앱의 다양한 설정을 변경할 수 있습니다.
            </Typo.Body>
          </div>
        </Tab.Content>

        <Tab.Content value="notifications">
          <div className="p-4 bg-gray-50 rounded-lg">
            <Typo.Body size="large" className="font-semibold mb-2">
              알림
            </Typo.Body>
            <Typo.Body size="medium" className="text-gray-600">
              알림 설정을 관리할 수 있습니다.
            </Typo.Body>
          </div>
        </Tab.Content>
      </Tab.Root>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Tab.Content를 사용하여 각 탭에 해당하는 콘텐츠를 표시할 수 있습니다.",
      },
    },
  },
};

// 다양한 너비
export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Small (300px)</h3>
        <div className="w-[300px]">
          <Tab.Root initialTab="tab1">
            <Tab.List>
              <Tab.Item value="tab1">
                <Typo.Body size="medium">탭 1</Typo.Body>
              </Tab.Item>
              <Tab.Item value="tab2">
                <Typo.Body size="medium">탭 2</Typo.Body>
              </Tab.Item>
            </Tab.List>
          </Tab.Root>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Medium (500px)</h3>
        <div className="w-[500px]">
          <Tab.Root initialTab="tab1">
            <Tab.List>
              <Tab.Item value="tab1">
                <Typo.SubTitle size="large">탭 1</Typo.SubTitle>
              </Tab.Item>
              <Tab.Item value="tab2">
                <Typo.SubTitle size="large">탭 2</Typo.SubTitle>
              </Tab.Item>
              <Tab.Item value="tab3">
                <Typo.SubTitle size="large">탭 3</Typo.SubTitle>
              </Tab.Item>
            </Tab.List>
          </Tab.Root>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Full Width</h3>
        <div className="w-full">
          <Tab.Root initialTab="tab1">
            <Tab.List>
              <Tab.Item value="tab1">
                <Typo.SubTitle size="large">탭 1</Typo.SubTitle>
              </Tab.Item>
              <Tab.Item value="tab2">
                <Typo.SubTitle size="large">탭 2</Typo.SubTitle>
              </Tab.Item>
              <Tab.Item value="tab3">
                <Typo.SubTitle size="large">탭 3</Typo.SubTitle>
              </Tab.Item>
            </Tab.List>
          </Tab.Root>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "다양한 너비의 Tab 컴포넌트입니다. 탭은 flex-1로 자동으로 공간을 균등하게 나눕니다.",
      },
    },
  },
};

// Interactive (실제 동작 확인)
export const Interactive: Story = {
  render: () => {
    const [currentTab, setCurrentTab] = React.useState("home");

    return (
      <div className="w-[500px] space-y-4">
        <div className="p-3 bg-violet-50 rounded-lg">
          <Typo.Body size="small" className="text-violet-700">
            현재 활성 탭: <span className="font-semibold">{currentTab}</span>
          </Typo.Body>
        </div>

        <Tab.Root value={currentTab} onValueChange={setCurrentTab}>
          <Tab.List>
            <Tab.Item value="home">
              <Typo.SubTitle size="large">홈</Typo.SubTitle>
            </Tab.Item>
            <Tab.Item value="explore">
              <Typo.SubTitle size="large">탐색</Typo.SubTitle>
            </Tab.Item>
            <Tab.Item value="library">
              <Typo.SubTitle size="large">라이브러리</Typo.SubTitle>
            </Tab.Item>
          </Tab.List>

          <Tab.Content value="home">
            <div className="p-6 bg-gray-50 rounded-lg mt-4">
              <Typo.Body size="large">🏠 홈 화면</Typo.Body>
            </div>
          </Tab.Content>

          <Tab.Content value="explore">
            <div className="p-6 bg-gray-50 rounded-lg mt-4">
              <Typo.Body size="large">🔍 탐색 화면</Typo.Body>
            </div>
          </Tab.Content>

          <Tab.Content value="library">
            <div className="p-6 bg-gray-50 rounded-lg mt-4">
              <Typo.Body size="large">📚 라이브러리 화면</Typo.Body>
            </div>
          </Tab.Content>
        </Tab.Root>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Controlled mode로 동작하는 Interactive Tab입니다. 탭 변경 시 상태가 실시간으로 업데이트됩니다.",
      },
    },
  },
};

// States (Disabled)
export const States: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Normal</h3>
        <div className="w-[400px]">
          <Tab.Root initialTab="tab1">
            <Tab.List>
              <Tab.Item value="tab1">
                <Typo.SubTitle size="large">활성</Typo.SubTitle>
              </Tab.Item>
              <Tab.Item value="tab2">
                <Typo.SubTitle size="large">비활성</Typo.SubTitle>
              </Tab.Item>
            </Tab.List>
          </Tab.Root>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">With Disabled Tab</h3>
        <div className="w-[400px]">
          <Tab.Root initialTab="tab1">
            <Tab.List>
              <Tab.Item value="tab1">
                <Typo.SubTitle size="large">탭 1</Typo.SubTitle>
              </Tab.Item>
              <Tab.Item value="tab2" disabled>
                <Typo.SubTitle size="large">비활성</Typo.SubTitle>
              </Tab.Item>
              <Tab.Item value="tab3">
                <Typo.SubTitle size="large">탭 3</Typo.SubTitle>
              </Tab.Item>
            </Tab.List>
          </Tab.Root>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tab의 다양한 상태를 보여줍니다. disabled prop으로 특정 탭을 비활성화할 수 있습니다.",
      },
    },
  },
};

// Real World Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h3 className="mb-4 text-lg font-semibold">사용자 프로필</h3>
        <div className="w-[600px]">
          <Tab.Root initialTab="userSurveys">
            <Tab.List>
              <Tab.Item value="userSurveys">
                <Typo.SubTitle size="large">내가 만든 설문</Typo.SubTitle>
              </Tab.Item>
              <Tab.Item value="userQuestions">
                <Typo.SubTitle size="large">내가 만든 질문</Typo.SubTitle>
              </Tab.Item>
            </Tab.List>

            <Tab.Content value="userSurveys">
              <div className="p-4 bg-gray-50 rounded-lg mt-4">
                <Typo.Body size="medium">설문 목록이 표시됩니다.</Typo.Body>
              </div>
            </Tab.Content>

            <Tab.Content value="userQuestions">
              <div className="p-4 bg-gray-50 rounded-lg mt-4">
                <Typo.Body size="medium">질문 목록이 표시됩니다.</Typo.Body>
              </div>
            </Tab.Content>
          </Tab.Root>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">설정 페이지</h3>
        <div className="w-[600px]">
          <Tab.Root initialTab="general">
            <Tab.List>
              <Tab.Item value="general">
                <Typo.SubTitle size="large">일반</Typo.SubTitle>
              </Tab.Item>
              <Tab.Item value="privacy">
                <Typo.SubTitle size="large">개인정보</Typo.SubTitle>
              </Tab.Item>
              <Tab.Item value="notifications">
                <Typo.SubTitle size="large">알림</Typo.SubTitle>
              </Tab.Item>
              <Tab.Item value="advanced">
                <Typo.SubTitle size="large">고급</Typo.SubTitle>
              </Tab.Item>
            </Tab.List>

            <Tab.Content value="general">
              <div className="p-6 bg-gray-50 rounded-lg mt-4 space-y-2">
                <Typo.Body size="large" className="font-semibold">
                  일반 설정
                </Typo.Body>
                <Typo.Body size="medium" className="text-gray-600">
                  언어, 테마 등 기본 설정을 변경할 수 있습니다.
                </Typo.Body>
              </div>
            </Tab.Content>

            <Tab.Content value="privacy">
              <div className="p-6 bg-gray-50 rounded-lg mt-4 space-y-2">
                <Typo.Body size="large" className="font-semibold">
                  개인정보 설정
                </Typo.Body>
                <Typo.Body size="medium" className="text-gray-600">
                  개인정보 보호 및 데이터 관리 설정입니다.
                </Typo.Body>
              </div>
            </Tab.Content>

            <Tab.Content value="notifications">
              <div className="p-6 bg-gray-50 rounded-lg mt-4 space-y-2">
                <Typo.Body size="large" className="font-semibold">
                  알림 설정
                </Typo.Body>
                <Typo.Body size="medium" className="text-gray-600">
                  앱 알림 설정을 관리할 수 있습니다.
                </Typo.Body>
              </div>
            </Tab.Content>

            <Tab.Content value="advanced">
              <div className="p-6 bg-gray-50 rounded-lg mt-4 space-y-2">
                <Typo.Body size="large" className="font-semibold">
                  고급 설정
                </Typo.Body>
                <Typo.Body size="medium" className="text-gray-600">
                  고급 사용자를 위한 추가 설정입니다.
                </Typo.Body>
              </div>
            </Tab.Content>
          </Tab.Root>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "실제 프로젝트에서 사용되는 Tab 컴포넌트의 예시입니다. 프로필 페이지와 설정 페이지에서의 사용 사례를 보여줍니다.",
      },
    },
  },
};

// Animation Demo
export const AnimationDemo: Story = {
  render: () => (
    <div className="w-[600px] space-y-4">
      <div className="p-3 bg-violet-50 rounded-lg">
        <Typo.Body size="small" className="text-violet-700">
          💡 탭을 클릭하면 하단 인디케이터가 부드럽게 이동합니다 (Framer Motion)
        </Typo.Body>
      </div>

      <Tab.Root initialTab="tab1">
        <Tab.List>
          <Tab.Item value="tab1">
            <Typo.SubTitle size="large">첫 번째</Typo.SubTitle>
          </Tab.Item>
          <Tab.Item value="tab2">
            <Typo.SubTitle size="large">두 번째</Typo.SubTitle>
          </Tab.Item>
          <Tab.Item value="tab3">
            <Typo.SubTitle size="large">세 번째</Typo.SubTitle>
          </Tab.Item>
          <Tab.Item value="tab4">
            <Typo.SubTitle size="large">네 번째</Typo.SubTitle>
          </Tab.Item>
        </Tab.List>
      </Tab.Root>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Framer Motion을 활용한 부드러운 애니메이션을 확인할 수 있습니다. 인디케이터가 spring 애니메이션으로 자연스럽게 이동합니다.",
      },
    },
  },
};
