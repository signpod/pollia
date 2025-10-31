import {
  Button,
  DrawerContent,
  DrawerHeader,
  DrawerProvider,
  Input,
  useDrawer,
} from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";

// 트리거 버튼 컴포넌트
function DrawerTrigger({ children }: { children: React.ReactNode }) {
  const { open } = useDrawer();
  return (
    <Button onClick={open} variant="primary">
      {children}
    </Button>
  );
}

const meta: Meta<typeof DrawerContent> = {
  title: "Common/Drawer",
  component: DrawerContent,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# Drawer

바텀에서 올라오는 서랍형 모달 컴포넌트입니다. Context API를 사용하여 상태를 관리합니다.

## 사용법

\`DrawerProvider\`로 감싸고 \`useDrawer\` 훅을 사용하여 제어합니다.

\`\`\`tsx
<DrawerProvider>
  <DrawerTrigger />
  <DrawerContent>
    <DrawerHeader>제목</DrawerHeader>
    <div className="p-5">
      컨텐츠
    </div>
  </DrawerContent>
</DrawerProvider>
\`\`\`

## 컴포넌트

- \`DrawerProvider\`: Context Provider, defaultOpen prop 지원
- \`DrawerContent\`: 실제 Drawer UI
- \`DrawerHeader\`: 헤더 (제목 + 닫기 버튼), showCloseButton으로 닫기 버튼 제어
- \`useDrawer\`: 상태 관리 훅 (open, close, toggle, isOpen)

## 기능

- ESC 키로 닫기
- 오버레이 클릭으로 닫기  
- 스프링 애니메이션
- 바디 스크롤 잠금
- 포털로 렌더링`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: { type: "text" },
      description: "추가 CSS 클래스",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 Drawer
export const Default: Story = {
  render: () => (
    <DrawerProvider>
      <DrawerTrigger>Drawer 열기</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>기본 Drawer</DrawerHeader>
        <div className="p-5 pb-8">
          <p className="mb-4 text-gray-600">
            이것은 기본 Drawer입니다. 헤더와 간단한 컨텐츠가 포함되어 있습니다.
          </p>
          <p className="text-sm text-gray-500">ESC 키를 누르거나 오버레이를 클릭하면 닫힙니다.</p>
        </div>
      </DrawerContent>
    </DrawerProvider>
  ),
};

// 헤더가 없는 Drawer
export const WithoutHeader: Story = {
  render: () => (
    <DrawerProvider>
      <DrawerTrigger>헤더 없는 Drawer</DrawerTrigger>
      <DrawerContent>
        <div className="p-5">
          <h3 className="mb-3 text-lg font-semibold">커스텀 헤더</h3>
          <p className="mb-4 text-gray-600">
            DrawerHeader 컴포넌트를 사용하지 않고 직접 헤더를 구성한 예시입니다.
          </p>
          <Button variant="secondary" fullWidth>
            액션 버튼
          </Button>
        </div>
      </DrawerContent>
    </DrawerProvider>
  ),
};

// 닫기 버튼이 없는 헤더
export const NoCloseButton: Story = {
  render: () => (
    <DrawerProvider>
      <DrawerTrigger>닫기 버튼 없음</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader showCloseButton={false}>닫기 버튼이 없는 헤더</DrawerHeader>
        <div className="p-5 pb-8">
          <p className="mb-4 text-gray-600">
            헤더에 닫기 버튼이 없습니다. ESC 키나 오버레이 클릭으로만 닫을 수 있습니다.
          </p>
          <Button variant="ghost" fullWidth>
            다른 액션
          </Button>
        </div>
      </DrawerContent>
    </DrawerProvider>
  ),
};

// 긴 컨텐츠 (스크롤)
export const LongContent: Story = {
  render: () => (
    <DrawerProvider>
      <DrawerTrigger>긴 컨텐츠 Drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>긴 컨텐츠</DrawerHeader>
        <div className="overflow-y-auto p-5 pb-8">
          <p className="mb-4 text-gray-600">
            이 Drawer는 긴 컨텐츠를 포함하고 있어 스크롤이 가능합니다.
          </p>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="mb-3 rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-medium">섹션 {i + 1}</h4>
              <p className="text-sm text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation.
              </p>
            </div>
          ))}
        </div>
      </DrawerContent>
    </DrawerProvider>
  ),
};

// 폼이 있는 복잡한 컨텐츠
export const WithForm: Story = {
  render: () => (
    <DrawerProvider>
      <DrawerTrigger>폼 Drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>사용자 정보 입력</DrawerHeader>
        <div className="space-y-4 p-5 pb-8">
          <Input label="이름" placeholder="이름을 입력하세요" required />
          <Input label="이메일" type="email" placeholder="이메일을 입력하세요" required />
          <Input label="전화번호" type="tel" placeholder="전화번호를 입력하세요" />
          <div className="space-y-2 pt-4">
            <Button fullWidth variant="primary">
              저장
            </Button>
            <Button fullWidth variant="ghost">
              취소
            </Button>
          </div>
        </div>
      </DrawerContent>
    </DrawerProvider>
  ),
};

// 기본 열림 상태
export const DefaultOpen: Story = {
  render: () => (
    <DrawerProvider defaultOpen>
      <DrawerTrigger>이미 열린 Drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>기본적으로 열린 상태</DrawerHeader>
        <div className="p-5 pb-8">
          <p className="text-gray-600">
            이 Drawer는 기본적으로 열린 상태로 렌더링됩니다. DrawerProvider의 defaultOpen prop을
            true로 설정했습니다.
          </p>
        </div>
      </DrawerContent>
    </DrawerProvider>
  ),
};

// 커스텀 스타일
export const CustomStyle: Story = {
  render: () => (
    <DrawerProvider>
      <DrawerTrigger>커스텀 스타일 Drawer</DrawerTrigger>
      <DrawerContent className="border-t-4 border-blue-500 bg-gradient-to-b from-blue-50 to-white">
        <DrawerHeader className="bg-blue-100/50">커스텀 스타일</DrawerHeader>
        <div className="p-5 pb-8">
          <div className="mb-4 rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">알림</h4>
            <p className="text-sm text-blue-700">
              이 Drawer는 커스텀 스타일이 적용되었습니다. 파란색 테마로 꾸며져 있습니다.
            </p>
          </div>
          <Button variant="primary" fullWidth className="bg-blue-600 hover:bg-blue-700">
            확인
          </Button>
        </div>
      </DrawerContent>
    </DrawerProvider>
  ),
};
