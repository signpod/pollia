import { FloatingButton } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Edit,
  Heart,
  MessageCircle,
  Plus,
  Share2,
} from "lucide-react";

const meta: Meta<typeof FloatingButton> = {
  title: "Common/FloatingButton",
  component: FloatingButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# FloatingButton

56px × 56px 크기의 원형 플로팅 버튼 컴포넌트입니다. 
ButtonV2의 스타일 시스템을 기반으로 하며, 3가지 variant를 지원합니다.

## 사용법

\`\`\`tsx
import { FloatingButton } from "@repo/ui/components";
import { Plus } from "lucide-react";

<FloatingButton 
  variant="primary"
  icon={Plus}
  onClick={() => console.log("clicked")}
/>
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary"],
      description: "버튼의 시각적 스타일",
    },
    icon: {
      description: "버튼 중앙에 표시할 아이콘",
    },
    disabled: {
      control: { type: "boolean" },
      description: "비활성화 상태",
    },
    onClick: {
      description: "클릭 이벤트 핸들러",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: Plus,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Button Variants</h3>
        <div className="flex flex-wrap gap-4">
          <FloatingButton variant="primary" icon={Plus} />
          <FloatingButton variant="secondary" icon={Plus} />
          <FloatingButton variant="tertiary" icon={Plus} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">With Different Icons</h3>
        <div className="flex flex-wrap gap-4">
          <FloatingButton variant="primary" icon={Heart} />
          <FloatingButton variant="secondary" icon={Edit} />
          <FloatingButton variant="tertiary" icon={Share2} />
        </div>
      </div>
    </div>
  ),
};

export const Icons: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Action Icons</h3>
        <div className="flex flex-wrap gap-4">
          <FloatingButton icon={Plus} />
          <FloatingButton icon={Edit} />
          <FloatingButton icon={Share2} />
          <FloatingButton icon={MessageCircle} />
          <FloatingButton icon={Heart} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Navigation Icons</h3>
        <div className="flex flex-wrap gap-4">
          <FloatingButton icon={ArrowUp} />
          <FloatingButton icon={ArrowDown} />
          <FloatingButton icon={ChevronDown} />
        </div>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Disabled State</h3>
      <div className="flex flex-wrap gap-4">
        <FloatingButton icon={Plus} disabled />
        <FloatingButton icon={Edit} disabled />
        <FloatingButton icon={Share2} disabled />
      </div>
    </div>
  ),
};

export const InteractionStates: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Interaction States</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col items-center gap-2">
          <FloatingButton icon={Plus} />
          <span className="text-xs text-gray-500">Default</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <FloatingButton icon={Plus} className="bg-button-primary-hover" />
          <span className="text-xs text-gray-500">Hover</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <FloatingButton icon={Plus} className="bg-button-primary-pressed" />
          <span className="text-xs text-gray-500">Active</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <FloatingButton icon={Plus} disabled />
          <span className="text-xs text-gray-500">Disabled</span>
        </div>
      </div>
    </div>
  ),
};

export const RealWorldUseCases: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Scroll to Bottom</h3>
        <div className="relative h-[400px] w-[375px] overflow-y-auto rounded-lg border bg-white p-4">
          <div className="space-y-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="rounded bg-gray-100 p-4">
                내용 {i + 1}
              </div>
            ))}
          </div>
          <div className="fixed bottom-6 right-6">
            <FloatingButton icon={ChevronDown} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Create Action</h3>
        <div className="relative h-[200px] w-[375px] rounded-lg border bg-gray-50 p-4">
          <p className="text-sm text-gray-600">설문 목록이 표시되는 영역</p>
          <div className="fixed bottom-6 right-6">
            <FloatingButton icon={Plus} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Edit Mode</h3>
        <div className="relative h-[200px] w-[375px] rounded-lg border bg-white p-4">
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>
          <div className="fixed bottom-6 right-6">
            <FloatingButton icon={Edit} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Back to Top</h3>
        <div className="relative h-[300px] w-[375px] overflow-y-auto rounded-lg border bg-white p-4">
          <div className="space-y-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="rounded bg-gray-100 p-4">
                내용 {i + 1}
              </div>
            ))}
          </div>
          <div className="fixed bottom-6 right-6">
            <FloatingButton icon={ArrowUp} />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const WithClickHandler: Story = {
  render: () => {
    const handleClick = () => {
      alert("FloatingButton clicked!");
    };

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Click Me!</h3>
        <FloatingButton icon={Plus} onClick={handleClick} />
      </div>
    );
  },
};

