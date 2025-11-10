import { Textarea } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

const meta: Meta<typeof Textarea> = {
  title: "Common/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: { type: "boolean" },
      description: "비활성화 상태",
    },
    errorMessage: {
      control: { type: "text" },
      description: "에러 메시지",
    },
    placeholder: {
      control: { type: "text" },
      description: "플레이스홀더 텍스트",
    },
    resize: {
      control: { type: "select" },
      options: ["none", "vertical", "horizontal", "both"],
      description: "리사이즈 옵션",
    },
    rows: {
      control: { type: "number" },
      description: "기본 줄 수",
    },
    maxLength: {
      control: { type: "number" },
      description: "최대 입력 글자 수",
    },
    showLength: {
      control: { type: "boolean" },
      description: "글자 수 표시 여부",
    },
    required: {
      control: { type: "boolean" },
      description: "필수 입력 여부",
    },
  },
  args: {
    label: "라벨",
    helperText: "헬퍼 텍스트",
    maxLength: 100,
    showLength: true,
    required: true,
    rows: 4,
    resize: "vertical",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 Textarea
export const Default: Story = {
  args: {
    placeholder: "텍스트를 입력하세요",
    label: "라벨",
    helperText: "헬퍼 텍스트",
    maxLength: 100,
    showLength: true,
    required: true,
  },
};

// 상태별 Textarea
export const States: Story = {
  render: args => (
    <div className="w-96 space-y-8">
      <Textarea placeholder="기본 상태입니다" {...args} />
      <Textarea placeholder="필수가 아닌 상태입니다" {...args} required={false} />
      <Textarea placeholder="비활성화된 상태입니다" disabled {...args} />
      <Textarea defaultValue="값이 있는 상태" {...args} />
      <Textarea
        placeholder="에러가 발생한 상태입니다"
        errorMessage="에러가 발생한 상태입니다"
        {...args}
      />
      <Textarea
        placeholder="값이 있는 상태입니다"
        defaultValue="잘못된 값이 있는 상태"
        errorMessage="잘못된 값이 있는 상태입니다"
        {...args}
      />
    </div>
  ),
};

// Resize 옵션
export const ResizeOptions: Story = {
  render: args => (
    <div className="w-96 space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium">Resize: None</h3>
        <Textarea
          {...args}
          label="리사이즈 불가"
          placeholder="크기 조절이 불가능합니다"
          resize="none"
        />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium">Resize: Vertical (기본)</h3>
        <Textarea
          {...args}
          label="세로 리사이즈"
          placeholder="세로로만 크기 조절이 가능합니다"
          resize="vertical"
        />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium">Resize: Horizontal</h3>
        <Textarea
          {...args}
          label="가로 리사이즈"
          placeholder="가로로만 크기 조절이 가능합니다"
          resize="horizontal"
        />
      </div>
      <div>
        <h3 className="mb-3 text-sm font-medium">Resize: Both</h3>
        <Textarea
          {...args}
          label="자유 리사이즈"
          placeholder="모든 방향으로 크기 조절이 가능합니다"
          resize="both"
        />
      </div>
    </div>
  ),
};

// 인터랙티브 예제
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = React.useState("");

    return (
      <div className="w-96 space-y-4">
        <Textarea
          label="설문 응답"
          placeholder="자유롭게 의견을 작성해주세요"
          helperText="최소 10자 이상 작성해주세요"
          value={value}
          onChange={e => setValue(e.target.value)}
          maxLength={500}
          showLength
          required
          rows={6}
        />
        <div className="rounded border border-zinc-200 bg-zinc-50 p-4">
          <p className="mb-2 text-sm font-medium">입력된 값:</p>
          <p className="text-sm text-zinc-600">{value || "(없음)"}</p>
        </div>
      </div>
    );
  },
};

// 글자 수 제한
export const WithMaxLength: Story = {
  render: () => {
    const [value, setValue] = React.useState("");

    return (
      <div className="w-96">
        <Textarea
          label="짧은 답변"
          placeholder="최대 50자까지 입력 가능합니다"
          helperText="간단하게 작성해주세요"
          value={value}
          onChange={e => setValue(e.target.value)}
          maxLength={50}
          showLength
          required
          rows={3}
        />
      </div>
    );
  },
};

// 라벨 없는 경우
export const WithoutLabel: Story = {
  args: {
    label: undefined,
    placeholder: "라벨 없이 사용할 수 있습니다",
    helperText: "필요에 따라 라벨을 생략할 수 있습니다",
  },
};
