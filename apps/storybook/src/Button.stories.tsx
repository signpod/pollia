import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "@repo/ui/button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    appName: {
      control: "text",
      description: "App name displayed in the alert",
    },
    children: {
      control: "text",
      description: "Button content",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    appName: "Storybook",
    children: "Primary Button",
    className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
  },
};

export const Secondary: Story = {
  args: {
    appName: "Storybook",
    children: "Secondary Button",
    className: "px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600",
  },
};

export const Large: Story = {
  args: {
    appName: "Storybook",
    children: "Large Button",
    className:
      "px-6 py-3 text-lg bg-green-500 text-white rounded hover:bg-green-600",
  },
};
