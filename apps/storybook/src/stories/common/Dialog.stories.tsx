import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  Button,
} from "@repo/ui/components";
import { X } from "lucide-react";

const meta: Meta<typeof Dialog> = {
  title: "Common/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# Dialog

Radix UI를 기반으로 한 모달 다이얼로그 컴포넌트입니다. 완전히 headless 방식으로 구현되어 내부 내용을 자유롭게 구성할 수 있습니다.

## 사용법

기본적인 Dialog 구조:

\`\`\`tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Dialog 열기</Button>
  </DialogTrigger>
  <DialogPortal>
    <DialogOverlay />
    <div className="dialog-content">
      {/* 내부 내용 자유롭게 구성 */}
      <DialogClose asChild>
        <Button>닫기</Button>
      </DialogClose>
    </div>
  </DialogPortal>
</Dialog>
\`\`\`

## 컴포넌트

- \`Dialog\`: 루트 컨테이너, 상태 관리
- \`DialogTrigger\`: Dialog를 여는 트리거 버튼  
- \`DialogPortal\`: 내용을 body에 포탈
- \`DialogOverlay\`: 배경 오버레이
- \`DialogClose\`: Dialog를 닫는 버튼

## 특징

- **완전 headless**: 내부 구조를 자유롭게 설계
- **접근성**: WAI-ARIA 패턴 준수, 키보드 네비게이션 지원
- **애니메이션**: CSS transition 지원
- **제어 가능**: open/onOpenChange props로 외부 제어 가능
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    defaultOpen: {
      control: { type: "boolean" },
      description: "초기 열림 상태",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    open: {
      control: { type: "boolean" },
      description: "제어된 열림 상태",
      table: {
        type: { summary: "boolean" },
      },
    },
    onOpenChange: {
      action: "onOpenChange",
      description: "상태 변경 콜백 함수",
      table: {
        type: { summary: "(open: boolean) => void" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 Dialog
export const Default: Story = {
  args: {
    defaultOpen: false,
  },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="primary">Dialog 열기</Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">기본 Dialog</h2>
            <DialogClose asChild>
              <button className="rounded-sm opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            이것은 기본 Dialog 컴포넌트입니다. 내부 내용을 바깥에서 자유롭게
            구성할 수 있습니다.
          </p>

          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="secondary">취소</Button>
            </DialogClose>
            <Button variant="primary">확인</Button>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  ),
};

// 다양한 상태들
export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">기본 상태</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="primary">기본 Dialog</Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">기본 Dialog</h2>
                <DialogClose asChild>
                  <button className="rounded-sm opacity-70 hover:opacity-100">
                    <X className="h-4 w-4" />
                  </button>
                </DialogClose>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                일반적인 Dialog입니다.
              </p>
              <DialogClose asChild>
                <Button variant="primary" className="w-full">
                  확인
                </Button>
              </DialogClose>
            </div>
          </DialogPortal>
        </Dialog>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">경고 Dialog</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="primary" className="bg-red-600 hover:bg-red-700">
              위험한 작업
            </Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-red-800">
                  정말 계속하시겠습니까?
                </h2>
                <DialogClose asChild>
                  <button className="rounded-sm opacity-70 hover:opacity-100">
                    <X className="h-4 w-4" />
                  </button>
                </DialogClose>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                이 작업은 되돌릴 수 없습니다. 신중하게 검토해주세요.
              </p>
              <div className="flex justify-end gap-3">
                <DialogClose asChild>
                  <Button variant="secondary">취소</Button>
                </DialogClose>
                <Button
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700"
                >
                  확인
                </Button>
              </div>
            </div>
          </DialogPortal>
        </Dialog>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">폼 Dialog</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">폼 입력</Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">사용자 정보</h2>
                <DialogClose asChild>
                  <button className="rounded-sm opacity-70 hover:opacity-100">
                    <X className="h-4 w-4" />
                  </button>
                </DialogClose>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">이름</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="이메일을 입력하세요"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <DialogClose asChild>
                  <Button variant="secondary">취소</Button>
                </DialogClose>
                <Button variant="primary">저장</Button>
              </div>
            </div>
          </DialogPortal>
        </Dialog>
      </div>
    </div>
  ),
};

// 다양한 크기들
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Dialog 크기</h3>
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">작은 Dialog</Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay />
              <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-md font-semibold">작은 Dialog</h2>
                  <DialogClose asChild>
                    <button className="rounded-sm opacity-70 hover:opacity-100">
                      <X className="h-3 w-3" />
                    </button>
                  </DialogClose>
                </div>
                <p className="text-sm text-gray-600 mb-4">간단한 메시지</p>
                <DialogClose asChild>
                  <Button variant="primary" className="w-full text-sm">
                    확인
                  </Button>
                </DialogClose>
              </div>
            </DialogPortal>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">중간 Dialog</Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay />
              <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">중간 Dialog</h2>
                  <DialogClose asChild>
                    <button className="rounded-sm opacity-70 hover:opacity-100">
                      <X className="h-4 w-4" />
                    </button>
                  </DialogClose>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  일반적인 크기의 Dialog입니다.
                </p>
                <DialogClose asChild>
                  <Button variant="primary" className="w-full">
                    확인
                  </Button>
                </DialogClose>
              </div>
            </DialogPortal>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">큰 Dialog</Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay />
              <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">큰 Dialog</h2>
                  <DialogClose asChild>
                    <button className="rounded-sm opacity-70 hover:opacity-100">
                      <X className="h-5 w-5" />
                    </button>
                  </DialogClose>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="font-medium mb-2">왼쪽 섹션</h4>
                    <p className="text-sm text-gray-600">
                      복잡한 내용을 담을 수 있습니다.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">오른쪽 섹션</h4>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-100 rounded"></div>
                      <div className="h-6 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>

                <DialogClose asChild>
                  <Button variant="primary" className="w-full">
                    확인
                  </Button>
                </DialogClose>
              </div>
            </DialogPortal>
          </Dialog>
        </div>
      </div>
    </div>
  ),
};

// 상호작용 및 제어
export const Interactive: Story = {
  render: () => {
    const [controlled, setControlled] = React.useState(false);
    const [counter, setCounter] = React.useState(0);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium">제어된 Dialog</h3>
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={() => setControlled(true)}>외부에서 열기</Button>
            <span className="text-sm text-gray-600">
              상태: {controlled ? "열림" : "닫힘"}
            </span>
          </div>

          <Dialog open={controlled} onOpenChange={setControlled}>
            <DialogPortal>
              <DialogOverlay />
              <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">제어된 Dialog</h2>
                  <DialogClose asChild>
                    <button className="rounded-sm opacity-70 hover:opacity-100">
                      <X className="h-4 w-4" />
                    </button>
                  </DialogClose>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  외부 상태로 Dialog를 제어할 수 있습니다.
                </p>

                <div className="flex gap-2 mb-6">
                  <Button
                    variant="secondary"
                    onClick={() => setControlled(false)}
                  >
                    닫기
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setControlled(false);
                      setTimeout(() => setControlled(true), 1000);
                    }}
                  >
                    1초 후 재열기
                  </Button>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setControlled(false)}
                >
                  확인
                </Button>
              </div>
            </DialogPortal>
          </Dialog>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">상태가 있는 Dialog</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">카운터 Dialog</Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay />
              <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">카운터</h2>
                  <DialogClose asChild>
                    <button className="rounded-sm opacity-70 hover:opacity-100">
                      <X className="h-4 w-4" />
                    </button>
                  </DialogClose>
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-4">{counter}</div>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setCounter(counter - 1)}
                    >
                      -1
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setCounter(counter + 1)}
                    >
                      +1
                    </Button>
                  </div>
                </div>

                <DialogClose asChild>
                  <Button variant="secondary" className="w-full">
                    닫기
                  </Button>
                </DialogClose>
              </div>
            </DialogPortal>
          </Dialog>
        </div>
      </div>
    );
  },
};

// 스타일링 예제
export const Styling: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">스타일 변형</h3>
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">둥근 Dialog</Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay className="bg-black/30" />
              <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-lg">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold mb-2">둥근 모서리</h2>
                  <p className="text-sm text-gray-600">
                    커스텀 스타일이 적용된 Dialog
                  </p>
                </div>
                <DialogClose asChild>
                  <Button variant="primary" className="rounded-full w-full">
                    확인
                  </Button>
                </DialogClose>
              </div>
            </DialogPortal>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">다크 Dialog</Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay className="bg-black/70" />
              <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-900 text-white p-6 shadow-lg border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    다크 테마
                  </h2>
                  <DialogClose asChild>
                    <button className="rounded-sm opacity-70 hover:opacity-100 text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </DialogClose>
                </div>

                <p className="text-sm text-gray-300 mb-6">
                  다크 테마가 적용된 Dialog입니다.
                </p>

                <div className="flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button
                      variant="secondary"
                      className="bg-gray-700 text-white hover:bg-gray-600"
                    >
                      취소
                    </Button>
                  </DialogClose>
                  <Button variant="primary">확인</Button>
                </div>
              </div>
            </DialogPortal>
          </Dialog>
        </div>
      </div>
    </div>
  ),
};
