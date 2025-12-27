import { BottomDrawer, Button, Input } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

const meta: Meta<typeof BottomDrawer> = {
  title: "Common/BottomDrawer",
  component: BottomDrawer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# BottomDrawer

화면 하단에 고정되어 접었다 펼칠 수 있는 확장 가능한 드로어 컴포넌트입니다. 합성 컴포넌트 패턴으로 구현되어 있어 유연하게 사용할 수 있습니다.

## 특징

- **항상 표시**: 닫혀있을 때도 일정 높이만큼 화면에 표시됩니다
- **클릭 확장**: 닫혀있을 때 보이는 부분을 클릭하면 자동으로 확장됩니다
- **드래그 지원**: 손가락으로 드래그하여 열고 닫을 수 있습니다
- **합성 패턴**: 컴포넌트를 조합하여 원하는 구조로 만들 수 있습니다
- **자동 높이 계산**: 컨텐츠에 맞춰 높이를 자동으로 계산합니다
- **스프링 애니메이션**: 부드러운 애니메이션 효과

## 사용법

\`\`\`tsx
import { BottomDrawer } from "@repo/ui/components";

function MyComponent() {
  return (
    <BottomDrawer collapsedHeight={100} expandedHeight={500}>
      <BottomDrawer.Content>
        <BottomDrawer.Header>
          <h2>제목</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p>내용</p>
        </BottomDrawer.Body>
        <BottomDrawer.Footer>
          <button>확인</button>
        </BottomDrawer.Footer>
      </BottomDrawer.Content>
      <BottomDrawer.Trigger>
        <button>열기</button>
      </BottomDrawer.Trigger>
    </BottomDrawer>
  );
}
\`\`\`

## 컴포넌트 구조

- \`BottomDrawer\`: Provider 컴포넌트 (collapsedHeight, expandedHeight 등 props 설정)
- \`BottomDrawer.Content\`: 실제 드로어 UI
- \`BottomDrawer.Trigger\`: 드로어를 열고 닫는 트리거 버튼
- \`BottomDrawer.Header\`: 헤더 영역 (제목 + 토글 버튼)
- \`BottomDrawer.Body\`: 본문 영역 (스크롤 가능)
- \`BottomDrawer.Footer\`: 푸터 영역

## Props

### BottomDrawer (Provider)
- \`collapsedHeight\`: 닫혀있을 때의 높이 (기본값: 80px)
- \`expandedHeight\`: 열렸을 때의 높이 (지정하지 않으면 자동 계산)
- \`defaultOpen\`: 기본 열림 상태 (기본값: false)
- \`onOpenChange\`: 열림/닫힘 상태 변경 콜백

### BottomDrawer.Content
- \`enableDrag\`: 드래그 활성화 여부 (기본값: true)
- \`dragThreshold\`: 드래그로 닫기 위한 최소 거리 (기본값: 50px)
- \`clickToExpand\`: 닫혀있을 때 클릭하여 확장 가능 여부 (기본값: true)
- \`className\`: 추가 CSS 클래스

### BottomDrawer.Header
- \`showToggleButton\`: 토글 버튼 표시 여부 (기본값: true)
- \`showCloseButton\`: 닫기 버튼 표시 여부 (기본값: false)
- \`className\`: 추가 CSS 클래스

## 기능

- 닫혀있을 때 보이는 부분 클릭하여 확장
- 드래그로 열기/닫기
- 헤더의 토글 버튼으로 열기/닫기
- 스프링 애니메이션
- 컨텐츠 높이 자동 계산
- 닫혀있을 때도 일부 컨텐츠 표시`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    collapsedHeight: {
      control: { type: "number", min: 50, max: 200, step: 10 },
      description: "닫혀있을 때의 높이 (px)",
    },
    expandedHeight: {
      control: { type: "number", min: 200, max: 1000, step: 50 },
      description: "열렸을 때의 높이 (px, 지정하지 않으면 자동 계산)",
    },
    defaultOpen: {
      control: { type: "boolean" },
      description: "기본 열림 상태",
    },
    onOpenChange: {
      control: false,
      description: "열림/닫힘 상태 변경 콜백",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={60}>
      <BottomDrawer.Content>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">기본 Bottom Drawer</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="mb-4 text-gray-600">
            이것은 기본 Bottom Drawer입니다. 닫혀있을 때 보이는 부분을 클릭하거나, 헤더의 토글
            버튼을 클릭하거나, 드래그하여 열고 닫을 수 있습니다.
          </p>
          <p className="text-sm text-gray-500">
            닫혀있을 때는 60px 높이만 표시되고, 열리면 컨텐츠 전체가 보입니다.
          </p>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "가장 기본적인 Bottom Drawer입니다. 닫혀있을 때도 일부가 보이며, 클릭하면 확장됩니다.",
      },
    },
  },
};

export const SmallHeight: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={60} expandedHeight={300}>
      <BottomDrawer.Content>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">작은 Drawer (60px / 300px)</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="text-gray-600">작은 크기의 Drawer입니다.</p>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "작은 크기의 Bottom Drawer입니다. collapsedHeight 60px, expandedHeight 300px로 설정되어 있습니다.",
      },
    },
  },
};

export const MediumHeight: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={100} expandedHeight={500}>
      <BottomDrawer.Content>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">중간 Drawer (100px / 500px)</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="text-gray-600">중간 크기의 Drawer입니다.</p>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "중간 크기의 Bottom Drawer입니다. collapsedHeight 100px, expandedHeight 500px로 설정되어 있습니다.",
      },
    },
  },
};

export const LargeHeight: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={120} expandedHeight={700}>
      <BottomDrawer.Content>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">큰 Drawer (120px / 700px)</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="text-gray-600">큰 크기의 Drawer입니다.</p>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "큰 크기의 Bottom Drawer입니다. collapsedHeight 120px, expandedHeight 700px로 설정되어 있습니다.",
      },
    },
  },
};

export const ToggleButtonOnly: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={80}>
      <BottomDrawer.Content>
        <BottomDrawer.Header showToggleButton={true} showCloseButton={false}>
          <h2 className="text-lg font-semibold">토글 버튼만</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="text-gray-600">토글 버튼만 표시됩니다.</p>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story: "헤더에 토글 버튼만 표시되는 Bottom Drawer입니다.",
      },
    },
  },
};

export const CloseButtonOnly: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={80}>
      <BottomDrawer.Content>
        <BottomDrawer.Header showToggleButton={false} showCloseButton={true}>
          <h2 className="text-lg font-semibold">닫기 버튼만</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="text-gray-600">닫기 버튼만 표시됩니다.</p>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story: "헤더에 닫기 버튼만 표시되는 Bottom Drawer입니다.",
      },
    },
  },
};

export const NoButtons: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={80}>
      <BottomDrawer.Content>
        <BottomDrawer.Header showToggleButton={false} showCloseButton={false}>
          <h2 className="text-lg font-semibold">버튼 없음</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="text-gray-600">버튼이 없습니다. 드래그로만 조작할 수 있습니다.</p>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story: "헤더에 버튼이 없는 Bottom Drawer입니다. 드래그로만 조작할 수 있습니다.",
      },
    },
  },
};

export const ClosedState: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={80} defaultOpen={false}>
      <BottomDrawer.Content>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">닫힌 상태</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="text-gray-600">기본적으로 닫힌 상태입니다.</p>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story: "기본적으로 닫힌 상태로 시작하는 Bottom Drawer입니다.",
      },
    },
  },
};

export const OpenState: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={80} defaultOpen={true}>
      <BottomDrawer.Content>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">열린 상태</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="text-gray-600">기본적으로 열린 상태입니다.</p>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story: "기본적으로 열린 상태로 시작하는 Bottom Drawer입니다.",
      },
    },
  },
};

export const DragDisabled: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={80}>
      <BottomDrawer.Content enableDrag={false}>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">드래그 비활성화</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="text-gray-600">
            드래그가 비활성화되어 있습니다. 헤더 버튼으로만 조작할 수 있습니다.
          </p>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "드래그가 비활성화된 Bottom Drawer입니다. 헤더의 토글 버튼으로만 조작할 수 있습니다.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => {
    const [openCount, setOpenCount] = React.useState(0);
    const [closeCount, setCloseCount] = React.useState(0);

    return (
      <div className="space-y-6 p-6">
        <div className="rounded-lg bg-gray-100 p-4">
          <h3 className="mb-2 text-lg font-semibold">상태 추적</h3>
          <div className="space-y-1 text-sm">
            <p>열린 횟수: {openCount}</p>
            <p>닫힌 횟수: {closeCount}</p>
          </div>
        </div>

        <BottomDrawer
          collapsedHeight={100}
          onOpenChange={isOpen => {
            if (isOpen) {
              setOpenCount(prev => prev + 1);
            } else {
              setCloseCount(prev => prev + 1);
            }
          }}
        >
          <BottomDrawer.Content>
            <BottomDrawer.Header>
              <h2 className="text-lg font-semibold">인터랙티브 Drawer</h2>
            </BottomDrawer.Header>
            <BottomDrawer.Body>
              <p className="mb-4 text-gray-600">
                이 Drawer는 열림/닫힘 상태를 추적합니다. 위의 카운터를 확인해보세요.
              </p>
              <p className="text-sm text-gray-500">
                헤더의 토글 버튼을 클릭하거나 드래그하여 열고 닫을 수 있습니다.
              </p>
            </BottomDrawer.Body>
          </BottomDrawer.Content>
        </BottomDrawer>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "인터랙티브한 Bottom Drawer입니다. onOpenChange 콜백을 통해 열림/닫힘 상태를 추적할 수 있습니다.",
      },
    },
  },
};

export const WithForm: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={100}>
      <BottomDrawer.Content>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">폼 입력</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <div className="space-y-4">
            <Input label="이름" placeholder="이름을 입력하세요" required />
            <Input label="이메일" type="email" placeholder="이메일을 입력하세요" required />
            <Input label="전화번호" type="tel" placeholder="전화번호를 입력하세요" />
          </div>
        </BottomDrawer.Body>
        <BottomDrawer.Footer>
          <div className="flex gap-2">
            <Button variant="primary" fullWidth>
              저장
            </Button>
            <Button variant="ghost" fullWidth>
              취소
            </Button>
          </div>
        </BottomDrawer.Footer>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story: "폼 입력이 있는 Bottom Drawer입니다. Footer에 액션 버튼을 배치할 수 있습니다.",
      },
    },
  },
};

export const LongContent: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={80}>
      <BottomDrawer.Content>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">긴 컨텐츠</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <div className="space-y-4">
            <p className="text-gray-600">
              이 Drawer는 긴 컨텐츠를 포함하고 있어 Body 영역에서 스크롤이 가능합니다.
            </p>
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-medium">섹션 {i + 1}</h4>
                <p className="text-sm text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  exercitation.
                </p>
              </div>
            ))}
          </div>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "긴 컨텐츠가 있는 Bottom Drawer입니다. Body 영역은 자동으로 스크롤 가능하며, 높이는 컨텐츠에 맞춰 자동으로 계산됩니다.",
      },
    },
  },
};

export const WithTrigger: Story = {
  render: () => (
    <div className="space-y-4 p-6">
      <BottomDrawer collapsedHeight={80}>
        <BottomDrawer.Content>
          <BottomDrawer.Header>
            <h2 className="text-lg font-semibold">외부 트리거</h2>
          </BottomDrawer.Header>
          <BottomDrawer.Body>
            <p className="text-gray-600">
              외부 버튼을 통해 Drawer를 제어할 수 있습니다. Trigger 컴포넌트를 사용하면 됩니다.
            </p>
          </BottomDrawer.Body>
        </BottomDrawer.Content>
        <div className="flex gap-2">
          <BottomDrawer.Trigger>
            <Button variant="primary">Drawer 열기</Button>
          </BottomDrawer.Trigger>
          <BottomDrawer.Trigger asChild>
            <Button variant="secondary">asChild로 열기</Button>
          </BottomDrawer.Trigger>
        </div>
      </BottomDrawer>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "외부 트리거 버튼을 사용하는 예시입니다. Trigger 컴포넌트를 사용하거나 asChild prop으로 기존 버튼을 트리거로 사용할 수 있습니다.",
      },
    },
  },
};

export const AutoHeight: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={60}>
      <BottomDrawer.Content>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">자동 높이</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="text-gray-600">
            expandedHeight를 지정하지 않으면 컨텐츠에 맞춰 자동으로 높이가 계산됩니다.
          </p>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "expandedHeight를 지정하지 않으면 컨텐츠에 맞춰 자동으로 높이가 계산되는 Bottom Drawer입니다.",
      },
    },
  },
};

export const FixedHeight: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={100} expandedHeight={400}>
      <BottomDrawer.Content>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">고정 높이 (400px)</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="text-gray-600">
            expandedHeight를 지정하면 해당 높이로 고정됩니다. 컨텐츠가 많으면 스크롤됩니다.
          </p>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "expandedHeight를 지정하여 높이가 고정된 Bottom Drawer입니다. 컨텐츠가 많으면 스크롤됩니다.",
      },
    },
  },
};

export const ClickToExpandEnabled: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={100}>
      <BottomDrawer.Content clickToExpand={true}>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">클릭하여 확장</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="mb-4 text-gray-600">
            이 Drawer는 닫혀있을 때 보이는 부분을 클릭하면 자동으로 확장됩니다. 위의 헤더 영역을
            클릭해보세요!
          </p>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              💡 팁: 닫혀있을 때 보이는 부분 어디든 클릭하면 확장됩니다. 하지만 아래 버튼을 클릭할
              때는 확장되지 않습니다.
            </p>
          </div>
          <div className="mt-4">
            <Button variant="primary" onClick={() => alert("버튼 클릭!")}>
              이 버튼 클릭 시에는 확장되지 않음
            </Button>
          </div>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "클릭 확장이 활성화된 Bottom Drawer입니다. 닫혀있을 때 보이는 부분을 클릭하면 자동으로 확장됩니다. 버튼이나 링크 같은 클릭 가능한 요소를 클릭할 때는 확장되지 않습니다.",
      },
    },
  },
};

export const ClickToExpandDisabled: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={100}>
      <BottomDrawer.Content clickToExpand={false}>
        <BottomDrawer.Header>
          <h2 className="text-lg font-semibold">클릭 확장 비활성화</h2>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <p className="mb-4 text-gray-600">
            이 Drawer는 클릭 확장이 비활성화되어 있습니다. 헤더의 토글 버튼을 클릭하거나 드래그하여
            열고 닫을 수 있습니다.
          </p>
          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ 클릭 확장이 비활성화되어 있어서, 닫혀있을 때 보이는 부분을 클릭해도 확장되지
              않습니다.
            </p>
          </div>
        </BottomDrawer.Body>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "클릭 확장이 비활성화된 Bottom Drawer입니다. clickToExpand를 false로 설정하면 클릭으로 확장할 수 없고, 헤더의 토글 버튼이나 드래그로만 조작할 수 있습니다.",
      },
    },
  },
};

export const ProductInfoExample: Story = {
  render: () => (
    <BottomDrawer collapsedHeight={120}>
      <BottomDrawer.Content>
        <BottomDrawer.Header>
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-lg font-semibold">상품 정보</h2>
              <p className="text-sm text-gray-500 mt-1">클릭하여 상세 정보 보기</p>
            </div>
          </div>
        </BottomDrawer.Header>
        <BottomDrawer.Body>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">상품 설명</h3>
              <p className="text-gray-600">
                이것은 상품의 상세 설명입니다. 닫혀있을 때는 헤더만 보이고, 클릭하면 전체 정보를 볼
                수 있습니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">가격</h3>
              <p className="text-2xl font-bold text-blue-600">29,000원</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">배송 정보</h3>
              <p className="text-gray-600">무료배송 | 당일발송</p>
            </div>
          </div>
        </BottomDrawer.Body>
        <BottomDrawer.Footer>
          <Button variant="primary" fullWidth>
            구매하기
          </Button>
        </BottomDrawer.Footer>
      </BottomDrawer.Content>
    </BottomDrawer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "실제 앱에서 사용할 수 있는 상품 정보 예시입니다. 닫혀있을 때는 미리보기 정보를 보여주고, 클릭하면 상세 정보를 볼 수 있습니다.",
      },
    },
  },
};
