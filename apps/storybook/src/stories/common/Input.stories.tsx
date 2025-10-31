import { Input } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof Input> = {
  title: "Common/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: { type: "boolean" },
    },
    errorMessage: {
      control: { type: "text" },
    },
    type: {
      control: { type: "select" },
      options: ["text", "email", "password", "number", "tel", "url"],
    },
    placeholder: {
      control: { type: "text" },
    },
  },
  args: {
    label: "라벨",
    helperText: "헬퍼 텍스트",
    maxLength: 20,
    showLength: true,
    required: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 Input
export const Default: Story = {
  args: {
    placeholder: "텍스트를 입력하세요",
    label: "라벨",
    helperText: "헬퍼 텍스트",
    maxLength: 20,
    showLength: true,
    required: true,
  },
};

// 상태별 Input
export const States: Story = {
  render: args => (
    <div className="w-80 space-y-8">
      <Input placeholder="기본 상태입니다" {...args} />
      <Input placeholder="비활성화된 상태입니다" disabled />
      <Input defaultValue="값이 있는 상태" {...args} />
      <Input
        placeholder="에러가 발생한 상태입니다"
        errorMessage="에러가 발생한 상태입니다"
        {...args}
      />
      <Input
        placeholder="값이 있는 상태입니다"
        defaultValue="잘못된 값이 있는 상태"
        errorMessage="잘못된 값이 있는 상태입니다"
        {...args}
      />
    </div>
  ),
};
