import { TimePicker } from "@/app/admin/components/common/atom/TimePicker";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AdminDecorator } from "../../../lib/AdminDecorator";

const meta = {
  title: "Admin/Atom/TimePicker",
  component: TimePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# TimePicker

시간과 분을 Select로 선택하는 Atom 컴포넌트입니다.

## 주요 기능
- 시간 (00-23) 선택
- 분 선택 (minuteStep에 따라 단위 조절)
- 시계 아이콘으로 시각적 구분
- disabled 상태 지원

## 사용법

\`\`\`tsx
import { TimePicker } from "@/app/admin/components/common/atom/TimePicker";

function MyComponent() {
  const [time, setTime] = useState<string | undefined>("14:30");
  
  return (
    <TimePicker
      value={time}
      onChange={setTime}
      minuteStep={5}
    />
  );
}
\`\`\`

## Props
- \`value\`: "HH:mm" 형식의 시간 문자열
- \`onChange\`: 시간 변경 콜백
- \`minuteStep\`: 분 단위 (1, 5, 10, 15, 30)
- \`disabled\`: 비활성화 여부
        `,
      },
    },
  },
  tags: ["autodocs"],
  decorators: [AdminDecorator],
  argTypes: {
    value: {
      description: '선택된 시간 ("HH:mm" 형식)',
      control: { type: "text" },
    },
    minuteStep: {
      description: "분 선택 단위",
      control: { type: "select" },
      options: [1, 5, 10, 15, 30],
    },
    disabled: {
      description: "비활성화 여부",
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultStory() {
  const [time, setTime] = useState<string | undefined>();
  return (
    <div className="flex flex-col gap-4">
      <TimePicker value={time} onChange={setTime} />
      <p className="text-sm text-muted-foreground">선택된 시간: {time || "없음"}</p>
    </div>
  );
}

export const Default: Story = {
  args: { onChange: () => {} },
  render: () => <DefaultStory />,
};

function WithInitialValueStory() {
  const [time, setTime] = useState<string | undefined>("14:30");
  return (
    <div className="flex flex-col gap-4">
      <TimePicker value={time} onChange={setTime} />
      <p className="text-sm text-muted-foreground">선택된 시간: {time || "없음"}</p>
    </div>
  );
}

export const WithInitialValue: Story = {
  args: { onChange: () => {} },
  render: () => <WithInitialValueStory />,
  parameters: {
    docs: {
      description: {
        story: "초기값으로 14:30이 설정된 상태입니다.",
      },
    },
  },
};

function MinuteStep1Story() {
  const [time, setTime] = useState<string | undefined>("09:00");
  return (
    <div className="flex flex-col gap-4">
      <TimePicker value={time} onChange={setTime} minuteStep={1} />
      <p className="text-sm text-muted-foreground">선택된 시간: {time || "없음"}</p>
    </div>
  );
}

export const MinuteStep1: Story = {
  args: { onChange: () => {} },
  render: () => <MinuteStep1Story />,
  parameters: {
    docs: {
      description: {
        story: "1분 단위로 선택 가능합니다. (00, 01, 02, ... 59)",
      },
    },
  },
};

function MinuteStep15Story() {
  const [time, setTime] = useState<string | undefined>("10:00");
  return (
    <div className="flex flex-col gap-4">
      <TimePicker value={time} onChange={setTime} minuteStep={15} />
      <p className="text-sm text-muted-foreground">선택된 시간: {time || "없음"}</p>
    </div>
  );
}

export const MinuteStep15: Story = {
  args: { onChange: () => {} },
  render: () => <MinuteStep15Story />,
  parameters: {
    docs: {
      description: {
        story: "15분 단위로 선택 가능합니다. (00, 15, 30, 45)",
      },
    },
  },
};

function MinuteStep30Story() {
  const [time, setTime] = useState<string | undefined>("12:00");
  return (
    <div className="flex flex-col gap-4">
      <TimePicker value={time} onChange={setTime} minuteStep={30} />
      <p className="text-sm text-muted-foreground">선택된 시간: {time || "없음"}</p>
    </div>
  );
}

export const MinuteStep30: Story = {
  args: { onChange: () => {} },
  render: () => <MinuteStep30Story />,
  parameters: {
    docs: {
      description: {
        story: "30분 단위로 선택 가능합니다. (00, 30)",
      },
    },
  },
};

function DisabledStory() {
  const [time, setTime] = useState<string | undefined>("18:00");
  return <TimePicker value={time} onChange={setTime} disabled />;
}

export const Disabled: Story = {
  args: { onChange: () => {} },
  render: () => <DisabledStory />,
  parameters: {
    docs: {
      description: {
        story: "비활성화된 상태입니다.",
      },
    },
  },
};
