import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button, ModalProvider, useModal, type ModalConfig } from "@repo/ui/components";

const meta: Meta<typeof ModalProvider> = {
  title: "Common/ModalProvider",
  component: ModalProvider,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# ModalProvider

Context API를 기반으로 한 범용 모달 컴포넌트입니다. 앱 전역에서 일관된 모달을 쉽게 사용할 수 있습니다.

## 특징

- **간편한 사용**: \`showModal\` 함수 하나로 모달 표시
- **완전 커스터마이징**: 제목, 설명, 버튼 텍스트, 콜백 등 모두 주입 가능
- **1~2개 버튼 지원**: 확인 버튼만, 또는 확인/취소 버튼 선택 가능
- **접근성**: Dialog 컴포넌트 기반으로 WAI-ARIA 준수

## 사용법

### 1. Provider 추가 (앱 최상위 또는 레이아웃)

\`\`\`tsx
import { ModalProvider } from "@repo/ui/components";

export default function RootLayout({ children }) {
  return (
    <ModalProvider>
      {children}
    </ModalProvider>
  );
}
\`\`\`

### 2. useModal Hook 사용

\`\`\`tsx
import { useModal } from "@repo/ui/components";

function MyComponent() {
  const { showModal } = useModal();

  const handleClick = () => {
    showModal({
      title: "알림",
      description: "작업이 완료되었습니다.",
      confirmText: "확인"
    });
  };

  return <button onClick={handleClick}>모달 열기</button>;
}
\`\`\`

### 3. 확인/취소 버튼 모달

\`\`\`tsx
showModal({
  title: "정말 삭제하시겠습니까?",
  description: "이 작업은 되돌릴 수 없습니다.",
  confirmText: "삭제",
  cancelText: "취소",
  showCancelButton: true,
  onConfirm: () => {
    // 삭제 로직
  },
  onCancel: () => {
    // 취소 로직
  }
});
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      description: "Provider로 감쌀 컴포넌트",
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Demo 컴포넌트들
function BasicModalDemo() {
  const { showModal } = useModal();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">기본 모달</h3>
      <Button
        variant="primary"
        onClick={() =>
          showModal({
            title: "알림",
            description: "작업이 성공적으로 완료되었습니다.",
            confirmText: "확인",
          })
        }
      >
        기본 모달 열기
      </Button>
    </div>
  );
}

function ConfirmModalDemo() {
  const { showModal } = useModal();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">확인/취소 모달</h3>
      <Button
        variant="primary"
        onClick={() =>
          showModal({
            title: "정말 삭제하시겠습니까?",
            description: "이 작업은 되돌릴 수 없습니다.",
            confirmText: "삭제",
            cancelText: "취소",
            showCancelButton: true,
            onConfirm: () => alert("삭제되었습니다!"),
            onCancel: () => alert("취소되었습니다."),
          })
        }
      >
        삭제 확인 모달
      </Button>
    </div>
  );
}

function VariousModalsDemo() {
  const { showModal } = useModal();

  return (
    <div className="flex flex-col gap-4 p-6">
      <h3 className="mb-2 text-lg font-semibold">다양한 시나리오</h3>

      <Button
        variant="primary"
        onClick={() =>
          showModal({
            title: "로그인 도중 오류가 발생했어요",
            description: "다시 시도해주세요.",
            confirmText: "확인",
          })
        }
      >
        에러 모달
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          showModal({
            title: "로그인이 필요합니다",
            description: "이 기능을 사용하려면 로그인이 필요합니다.",
            confirmText: "로그인하기",
            cancelText: "나중에",
            showCancelButton: true,
            onConfirm: () => alert("로그인 페이지로 이동"),
          })
        }
      >
        로그인 유도 모달
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          showModal({
            title: "투표가 생성되었습니다!",
            description: "친구들과 공유해보세요.",
            confirmText: "공유하기",
            cancelText: "나중에",
            showCancelButton: true,
          })
        }
      >
        성공 모달
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          showModal({
            title: "정말 나가시겠습니까?",
            description: "작성 중인 내용이 저장되지 않습니다.",
            confirmText: "나가기",
            cancelText: "계속 작성",
            showCancelButton: true,
            onConfirm: () => alert("페이지를 나갑니다."),
          })
        }
      >
        경고 모달
      </Button>
    </div>
  );
}

function CallbackDemo() {
  const { showModal } = useModal();
  const [count, setCount] = React.useState(0);

  return (
    <div className="flex flex-col gap-4 p-6">
      <h3 className="text-lg font-semibold">콜백 함수 테스트</h3>
      <div className="rounded-lg bg-gray-100 p-4 text-center">
        <p className="mb-2 text-sm text-gray-600">카운터</p>
        <p className="text-3xl font-bold">{count}</p>
      </div>
      <Button
        variant="primary"
        onClick={() =>
          showModal({
            title: "카운터를 증가시키시겠습니까?",
            description: "확인을 누르면 카운터가 1 증가합니다.",
            confirmText: "증가",
            cancelText: "취소",
            showCancelButton: true,
            onConfirm: () => setCount(count + 1),
            onCancel: () => alert("취소되었습니다."),
          })
        }
      >
        카운터 증가 모달
      </Button>
    </div>
  );
}

function LongTextDemo() {
  const { showModal } = useModal();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">긴 텍스트</h3>
      <Button
        variant="primary"
        onClick={() =>
          showModal({
            title: "서비스 이용약관",
            description:
              "본 약관은 폴리아 서비스를 이용하는 모든 사용자에게 적용됩니다. 서비스를 이용하시기 전에 반드시 약관 내용을 확인해주세요.",
            confirmText: "동의",
            cancelText: "거부",
            showCancelButton: true,
          })
        }
      >
        긴 설명 모달
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          showModal({
            title: "이것은 아주 긴 제목입니다. 제목이 얼마나 잘 표시되는지 확인해봅시다.",
            description: "짧은 설명",
            confirmText: "확인",
          })
        }
      >
        긴 제목 모달
      </Button>
    </div>
  );
}

// 스토리들
export const Default: Story = {
  render: () => (
    <ModalProvider>
      <BasicModalDemo />
    </ModalProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: "가장 기본적인 모달입니다. 제목, 설명, 확인 버튼만 있습니다.",
      },
    },
  },
};

export const WithCancelButton: Story = {
  render: () => (
    <ModalProvider>
      <ConfirmModalDemo />
    </ModalProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "확인/취소 버튼이 있는 모달입니다. `showCancelButton: true`로 설정하면 취소 버튼이 표시됩니다.",
      },
    },
  },
};

export const VariousScenarios: Story = {
  render: () => (
    <ModalProvider>
      <VariousModalsDemo />
    </ModalProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "실제 앱에서 사용될 수 있는 다양한 시나리오의 모달들입니다. 에러, 로그인 유도, 성공, 경고 등 다양한 상황에 맞게 사용할 수 있습니다.",
      },
    },
  },
};

export const WithCallbacks: Story = {
  render: () => (
    <ModalProvider>
      <CallbackDemo />
    </ModalProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`onConfirm`, `onCancel` 콜백 함수를 통해 버튼 클릭 시 원하는 동작을 실행할 수 있습니다.",
      },
    },
  },
};

export const LongText: Story = {
  render: () => (
    <ModalProvider>
      <LongTextDemo />
    </ModalProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: "긴 제목이나 긴 설명 텍스트가 어떻게 표시되는지 확인할 수 있습니다.",
      },
    },
  },
};

// Interactive Playground
export const Playground: Story = {
  render: () => (
    <ModalProvider>
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">모달 플레이그라운드</h3>
        <p className="mb-6 text-sm text-gray-600">
          아래 버튼들을 클릭하여 다양한 모달을 테스트해보세요.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <BasicModalDemo />
          <ConfirmModalDemo />
        </div>
      </div>
    </ModalProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "여러 모달을 한 번에 테스트할 수 있는 플레이그라운드입니다. 실제 프로젝트에 통합하기 전에 동작을 확인해보세요.",
      },
    },
  },
};
