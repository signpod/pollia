import { IconButton } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ChevronDown, ChevronUp, Heart, Minus, Plus, Settings } from "lucide-react";
import * as React from "react";

const meta: Meta<typeof IconButton> = {
  title: "Common/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# IconButton

아이콘을 포함한 버튼 컴포넌트입니다. 세 가지 상태(default, pressed, disabled)를 지원합니다.

## 사용법

\`\`\`tsx
import { IconButton } from "@repo/ui/components";
import { Plus } from "lucide-react";

<IconButton icon={Plus} onClick={handleClick} />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`icon\` | \`LucideIcon \\| React.ComponentType<React.SVGProps<SVGSVGElement>>\` | - | 아이콘 컴포넌트 (필수) |
| \`disabled\` | \`boolean\` | \`false\` | 비활성화 상태 |
| \`className\` | \`string\` | - | 추가 CSS 클래스 |

## 상태

- **default**: 기본 상태 (투명 배경, 검은색 아이콘)
- **hover**: 호버 상태 (연한 회색 배경)
- **active**: 눌린 상태 (진한 회색 배경) - CSS로 자동 처리
- **disabled**: 비활성화 상태 (투명 배경, 회색 아이콘)

## 크기

- **고정**: 24x24px (아이콘과 버튼 동일 크기, 패딩 없음)`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: { type: "boolean" },
      description: "비활성화 상태",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 IconButton
export const Default: Story = {
  render: () => <IconButton icon={Plus} />,
};

// 모든 상태
export const States: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Button States</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="mb-2 text-xs text-gray-500">Default</p>
            <IconButton icon={ChevronUp} />
          </div>
          <div className="text-center">
            <p className="mb-2 text-xs text-gray-500">Disabled</p>
            <IconButton icon={ChevronUp} disabled />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Different Icons</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="mb-2 text-xs text-gray-500">Plus</p>
            <IconButton icon={Plus} />
          </div>
          <div className="text-center">
            <p className="mb-2 text-xs text-gray-500">Minus</p>
            <IconButton icon={Minus} />
          </div>
          <div className="text-center">
            <p className="mb-2 text-xs text-gray-500">Heart</p>
            <IconButton icon={Heart} />
          </div>
          <div className="text-center">
            <p className="mb-2 text-xs text-gray-500">Settings</p>
            <IconButton icon={Settings} />
          </div>
        </div>
      </div>
    </div>
  ),
};

// 크기별
export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Small Size (24x24)</h3>
        <div className="flex items-center gap-4">
          <IconButton icon={Plus} />
          <IconButton icon={Minus} />
          <IconButton icon={ChevronUp} disabled />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Medium Size (32x32)</h3>
        <div className="flex items-center gap-4">
          <IconButton icon={Plus} />
          <IconButton icon={Minus} />
          <IconButton icon={ChevronUp} disabled />
        </div>
      </div>
    </div>
  ),
};

// 비활성화 상태
export const Disabled: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Disabled with disabled prop</h3>
        <div className="flex items-center gap-4">
          <IconButton icon={Plus} disabled />
          <IconButton icon={Minus} disabled />
          <IconButton icon={Heart} disabled />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Disabled with state prop</h3>
        <div className="flex items-center gap-4">
          <IconButton icon={Plus} disabled />
          <IconButton icon={Minus} disabled />
          <IconButton icon={Heart} disabled />
        </div>
      </div>
    </div>
  ),
};

// 인터랙티브 예시
export const Interactive: Story = {
  render: () => {
    const [counts, setCounts] = React.useState<Record<string, number>>({
      heart: 0,
      settings: 0,
    });

    const increment = (id: string) => {
      setCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    return (
      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-medium">Interactive Example</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <IconButton icon={Heart} onClick={() => increment("heart")} />
              <p className="mt-1 text-xs text-gray-500">Clicked: {counts.heart}</p>
            </div>
            <div className="text-center">
              <IconButton icon={Settings} onClick={() => increment("settings")} />
              <p className="mt-1 text-xs text-gray-500">Clicked: {counts.settings}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            클릭하면 카운터가 증가하고, active 상태를 볼 수 있습니다.
          </p>
        </div>
      </div>
    );
  },
};

// 실제 사용 사례
export const RealWorldUseCases: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Counter Controls</h3>
        <div className="flex items-center gap-1">
          <IconButton icon={Minus} />
          <div className="flex h-6 w-6 items-center justify-center">
            <span className="text-base font-bold">5</span>
          </div>
          <IconButton icon={Plus} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Navigation Controls</h3>
        <div className="flex gap-2">
          <IconButton icon={ChevronUp} />
          <IconButton icon={ChevronDown} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Action Buttons</h3>
        <div className="flex gap-2">
          <IconButton icon={Heart} />
          <IconButton icon={Settings} />
        </div>
      </div>
    </div>
  ),
};
