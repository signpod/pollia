import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button, KakaoLoginButton } from "@repo/ui/components";

const meta: Meta<typeof Button> = {
  title: "Common/Button",
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
    fullWidth: {
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
      <Button variant="ghost" textAlign="left">
        button
      </Button>
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

export const Loading: Story = {
  render: () => (
    <div className="w-80 max-w-md space-y-4">
      <Button fullWidth loading />
      <Button variant="secondary" fullWidth loading />
    </div>
  ),
};

// 아이콘이 있는 버튼
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button
        leftIcon={
          <svg
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
          </svg>
        }
      >
        Add Item
      </Button>
      <Button
        variant="secondary"
        leftIcon={
          <svg
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
          </svg>
        }
      >
        Upload
      </Button>
    </div>
  ),
};

// Full Width 버튼
export const FullWidth: Story = {
  render: () => (
    <div className="w-80 max-w-md space-y-4">
      <Button fullWidth>Full Width Primary</Button>
      <Button
        fullWidth
        leftIcon={
          <svg
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
          </svg>
        }
      >
        Full Width Primary with Icon
      </Button>
      <Button variant="secondary" fullWidth>
        Full Width Secondary
      </Button>
      <Button variant="ghost" fullWidth textAlign="left">
        Full Width Ghost
      </Button>
    </div>
  ),
};

export const KakaoLogin: Story = {
  render: () => (
    <div className="w-80 max-w-md">
      <KakaoLoginButton fullWidth />
    </div>
  ),
};
