import { Button, KakaoLoginButton } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";

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
      options: ["primary", "secondary", "ghost"],
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
    loading: {
      control: { type: "boolean" },
    },
    textAlign: {
      control: { type: "select" },
      options: ["left", "center", "right"],
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
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Button Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary (Outline)</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">With Icons</h3>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="primary"
            leftIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            Primary
          </Button>
          <Button
            variant="secondary"
            leftIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            Secondary
          </Button>
          <Button
            variant="ghost"
            leftIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            Ghost
          </Button>
        </div>
      </div>
    </div>
  ),
};

// 비활성화된 버튼
export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Disabled States</h3>
      <div className="flex flex-wrap gap-4">
        <Button disabled>Disabled Primary</Button>
        <Button variant="secondary" disabled>
          Disabled Secondary
        </Button>
        <Button variant="ghost" disabled>
          Disabled Ghost
        </Button>
      </div>
    </div>
  ),
};

// 상호작용 상태 (Hover/Active 미리보기)
export const InteractionStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Primary Variant States</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Default</Button>
          <Button variant="primary" className="hover:bg-[var(--color-zinc-600)]">
            Hover Effect
          </Button>
          <Button variant="primary" className="bg-[var(--color-zinc-950)]">
            Pressed Effect
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Secondary Variant States</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary">Default</Button>
          <Button variant="secondary" className="ring-[var(--color-violet-500)]">
            Hover Effect
          </Button>
          <Button
            variant="secondary"
            className="bg-[var(--color-violet-50)] text-[var(--color-violet-500)] ring-[var(--color-violet-500)]"
          >
            Pressed Effect
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Ghost Variant States</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="ghost">Default</Button>
          <Button variant="ghost" className="bg-[var(--color-zinc-50)]">
            Pressed Effect
          </Button>
        </div>
      </div>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="w-80 max-w-md space-y-4">
      <h3 className="mb-3 text-sm font-medium">Loading States</h3>
      <Button fullWidth loading />
      <Button variant="secondary" fullWidth loading />
      <Button variant="ghost" fullWidth loading />
    </div>
  ),
};

// 아이콘이 있는 버튼
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button
        leftIcon={
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      >
        Add Item
      </Button>
      <Button
        variant="secondary"
        leftIcon={
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
      <h3 className="mb-3 text-sm font-medium">Full Width Buttons</h3>
      <Button fullWidth>Full Width Primary</Button>
      <Button variant="secondary" fullWidth>
        Full Width Secondary
      </Button>
      <Button variant="ghost" fullWidth textAlign="left">
        Full Width Ghost (Left Aligned)
      </Button>
      <Button
        fullWidth
        leftIcon={
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      >
        With Icon
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
