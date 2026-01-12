import { DatePicker } from "@/app/admin/components/common/atom/DatePicker";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AdminDecorator } from "../../../lib/AdminDecorator";

const meta = {
  title: "Admin/Atom/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# DatePicker

Calendar + Popover 기반의 날짜 선택 Atom 컴포넌트입니다.

## 주요 기능
- Popover 형태의 캘린더 UI
- 한국어 로케일 지원 (yyyy년 M월 d일 형식)
- 날짜 선택 시 자동 닫힘
- disabled 상태 지원

## 사용법

\`\`\`tsx
import { DatePicker } from "@/app/admin/components/common/atom/DatePicker";

function MyComponent() {
  const [date, setDate] = useState<Date | undefined>();
  
  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="날짜 선택"
    />
  );
}
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
  decorators: [AdminDecorator],
  argTypes: {
    value: {
      description: "선택된 날짜 (Date 객체)",
      control: { type: "date" },
    },
    placeholder: {
      description: "날짜가 선택되지 않았을 때 표시되는 텍스트",
      control: { type: "text" },
    },
    disabled: {
      description: "비활성화 여부",
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultStory() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <div className="flex flex-col gap-4">
      <DatePicker value={date} onChange={setDate} />
      <p className="text-sm text-muted-foreground">
        선택된 날짜: {date ? date.toLocaleDateString("ko-KR") : "없음"}
      </p>
    </div>
  );
}

export const Default: Story = {
  args: { onChange: () => {} },
  render: () => <DefaultStory />,
};

function WithInitialValueStory() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <div className="flex flex-col gap-4">
      <DatePicker value={date} onChange={setDate} />
      <p className="text-sm text-muted-foreground">
        선택된 날짜: {date ? date.toLocaleDateString("ko-KR") : "없음"}
      </p>
    </div>
  );
}

export const WithInitialValue: Story = {
  args: { onChange: () => {} },
  render: () => <WithInitialValueStory />,
  parameters: {
    docs: {
      description: {
        story: "초기값으로 오늘 날짜가 설정된 상태입니다.",
      },
    },
  },
};

function CustomPlaceholderStory() {
  const [date, setDate] = useState<Date | undefined>();
  return <DatePicker value={date} onChange={setDate} placeholder="마감일 선택" />;
}

export const CustomPlaceholder: Story = {
  args: { onChange: () => {} },
  render: () => <CustomPlaceholderStory />,
  parameters: {
    docs: {
      description: {
        story: "커스텀 placeholder 텍스트를 사용하는 예시입니다.",
      },
    },
  },
};

function DisabledStory() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return <DatePicker value={date} onChange={setDate} disabled />;
}

export const Disabled: Story = {
  args: { onChange: () => {} },
  render: () => <DisabledStory />,
  parameters: {
    docs: {
      description: {
        story: "비활성화된 상태입니다. 클릭해도 캘린더가 열리지 않습니다.",
      },
    },
  },
};
