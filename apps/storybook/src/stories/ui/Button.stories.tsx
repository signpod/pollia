import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@repo/ui/components";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "destructive"],
    },
    isFullWidth: {
      control: { type: "boolean" },
    },
    asChild: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 버튼
export const Default: Story = {
  args: {
    children: "Button",
  },
};

// 모든 variant 스토리
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Default</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  ),
};

// 비활성화된 버튼
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>Disabled Default</Button>
      <Button variant="secondary" disabled>
        Disabled Secondary
      </Button>
    </div>
  ),
};

// 아이콘이 있는 버튼
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button leftIcon={<svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>}>
        
        Add Item
      </Button>
      <Button variant="secondary" leftIcon={<svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>}>
        
        Upload
      </Button>
    </div>
  ),
};

// Full Width 버튼
export const FullWidth: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <Button isFullWidth>Full Width Primary</Button>
      <Button isFullWidth leftIcon={<svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>}>
        
        Full Width Primary with Icon
      </Button>
      <Button variant="secondary" isFullWidth>
        Full Width Secondary
      </Button>
    </div>
  ),
};

// asChild 사용 예시
export const AsChild: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button asChild>
        <a href="#" onClick={(e) => e.preventDefault()}>
          Link Button
        </a>
      </Button>
      <Button variant="secondary" asChild>
        <a href="#" onClick={(e) => e.preventDefault()}>
          Secondary Link
        </a>
      </Button>
    </div>
  ),
};

// Playground - 모든 props 조작 가능
export const Playground: Story = {
  args: {
    children: "Button",
    variant: "primary",
    isFullWidth: false,
    disabled: false,
    asChild: false,
  },
};
