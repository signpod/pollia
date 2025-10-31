import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { TimePicker } from "@repo/ui/components";

const meta: Meta<typeof TimePicker> = {
  title: "Common/TimePicker",
  component: TimePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# TimePicker

시간을 선택할 수 있는 **완전한 controlled 컴포넌트**입니다.

## 기본 사용법

\`\`\`tsx
import { useState } from "react";
import { TimePicker } from "@repo/ui/components";

function MyComponent() {
  const [time, setTime] = useState("14:30");

  return (
    <TimePicker
      value={time}              // HH:MM 형식 (24시간제)
      onValueChange={setTime}   // 시간 변경 콜백
    />
  );
}
\`\`\`

## Drawer와 함께 사용

DateAndTimePicker 컴포넌트에서 사용되는 패턴:

\`\`\`tsx
import { DrawerProvider, DrawerContent, TimePicker, Button, useDrawer } from "@repo/ui/components";

function TimePickerButton() {
  const { open } = useDrawer();
  return <button onClick={open}>시간 선택</button>;
}

function TimePickerContent() {
  const { close } = useDrawer();
  const [time, setTime] = useState("14:30");

  return (
    <>
      <TimePicker value={time} onValueChange={setTime} />
      <Button onClick={close}>확인</Button>
    </>
  );
}

function MyComponent() {
  return (
    <DrawerProvider>
      <TimePickerButton />
      <DrawerContent>
        <TimePickerContent />
      </DrawerContent>
    </DrawerProvider>
  );
}
\`\`\`

## Props

- **value**: \`string\` - 선택된 시간 (HH:MM 형식, 24시간제)
- **onValueChange**: \`(value: string) => void\` - 시간 변경 콜백
- **className**: \`string\` - 추가 CSS 클래스 (선택적)

## 주요 기능

- **시간 선택**: 1시간 단위로 0~23시 선택
- **분 선택**: 5분 단위로 0~55분 선택 (00, 05, 10, ..., 55)
- **오전/오후 표시**: 자동으로 오전(0-11시) / 오후(12-23시) 표시
- **Chevron 버튼**: 위/아래 화살표로 값 증감
- **드래그 지원**: 마우스/터치로 드래그하여 값 변경 (30px당 1단위)
- **2자리 표기**: 시간과 분 모두 00, 05, 12와 같이 2자리로 표시
- **24시간제**: 내부적으로 24시간제로 관리`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "text" },
      description: "선택된 시간 (HH:MM 형식, 24시간제)",
    },
    className: {
      control: { type: "text" },
      description: "추가 CSS 클래스",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 TimePicker
export const Default: Story = {
  render: () => {
    const [time, setTime] = useState("14:30");

    return (
      <div className="p-6">
        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-600">선택된 시간: {time}</p>
        </div>
        <TimePicker value={time} onValueChange={setTime} />
      </div>
    );
  },
};

// 다양한 초기 시간
export const DifferentTimes: Story = {
  render: () => {
    const [morning, setMorning] = useState("09:00");
    const [afternoon, setAfternoon] = useState("14:30");
    const [evening, setEvening] = useState("18:45");
    const [midnight, setMidnight] = useState("00:00");

    return (
      <div className="space-y-8 p-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold">오전 9:00</h3>
          <p className="mb-2 text-xs text-gray-600">선택된 시간: {morning}</p>
          <TimePicker value={morning} onValueChange={setMorning} />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">오후 2:30</h3>
          <p className="mb-2 text-xs text-gray-600">선택된 시간: {afternoon}</p>
          <TimePicker value={afternoon} onValueChange={setAfternoon} />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">오후 6:45</h3>
          <p className="mb-2 text-xs text-gray-600">선택된 시간: {evening}</p>
          <TimePicker value={evening} onValueChange={setEvening} />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">오전 0:00 (자정)</h3>
          <p className="mb-2 text-xs text-gray-600">선택된 시간: {midnight}</p>
          <TimePicker value={midnight} onValueChange={setMidnight} />
        </div>
      </div>
    );
  },
};

// 오전/오후 전환 데모
export const AMPMTransition: Story = {
  render: () => {
    const [time, setTime] = useState("11:55");

    return (
      <div className="p-6">
        <div className="mb-4 space-y-2">
          <h3 className="text-sm font-semibold">오전/오후 전환 테스트</h3>
          <p className="text-xs text-gray-600">
            11:55에서 시작합니다. 시간을 증가시켜 12:00(오후)로 전환해보세요.
          </p>
          <p className="text-sm font-medium">
            현재 시간: {time} ({parseInt(time.split(":")[0] || "0") < 12 ? "오전" : "오후"})
          </p>
        </div>
        <TimePicker value={time} onValueChange={setTime} />
      </div>
    );
  },
};

// 5분 단위 선택 데모
export const FiveMinuteSteps: Story = {
  render: () => {
    const [time, setTime] = useState("12:00");

    return (
      <div className="p-6">
        <div className="mb-4 space-y-2">
          <h3 className="text-sm font-semibold">5분 단위 선택</h3>
          <p className="text-xs text-gray-600">
            분은 5분 단위로만 선택됩니다 (00, 05, 10, ..., 55)
          </p>
          <p className="text-sm font-medium">선택된 시간: {time}</p>
        </div>
        <TimePicker value={time} onValueChange={setTime} />
      </div>
    );
  },
};

// 드래그 기능 안내
export const DragInteraction: Story = {
  render: () => {
    const [time, setTime] = useState("12:30");

    return (
      <div className="p-6">
        <div className="mb-4 space-y-2">
          <h3 className="text-sm font-semibold">드래그 인터랙션</h3>
          <p className="mb-1 text-xs text-gray-600">
            숫자를 위/아래로 드래그하여 값을 변경할 수 있습니다.
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs text-gray-600">
            <li>마우스 드래그: 클릭 후 위/아래로 드래그</li>
            <li>터치 드래그: 터치 후 위/아래로 스와이프</li>
            <li>30px 드래그당 1단위 변경</li>
          </ul>
          <p className="mt-3 text-sm font-medium">선택된 시간: {time}</p>
        </div>
        <TimePicker value={time} onValueChange={setTime} />
      </div>
    );
  },
};

// 버튼 인터랙션
export const ButtonInteraction: Story = {
  render: () => {
    const [time, setTime] = useState("12:30");

    return (
      <div className="p-6">
        <div className="mb-4 space-y-2">
          <h3 className="text-sm font-semibold">Chevron 버튼 인터랙션</h3>
          <p className="mb-1 text-xs text-gray-600">
            위/아래 화살표 버튼을 클릭하여 값을 변경할 수 있습니다.
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs text-gray-600">
            <li>시간: 1시간 단위로 증감 (0~23시 순환)</li>
            <li>분: 5분 단위로 증감 (0~55분 순환)</li>
          </ul>
          <p className="mt-3 text-sm font-medium">선택된 시간: {time}</p>
        </div>
        <TimePicker value={time} onValueChange={setTime} />
      </div>
    );
  },
};

// 커스텀 스타일
export const CustomStyle: Story = {
  render: () => {
    const [time, setTime] = useState("15:45");

    return (
      <div className="p-6">
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold">커스텀 스타일</h3>
          <p className="text-sm font-medium">선택된 시간: {time}</p>
        </div>
        <TimePicker
          value={time}
          onValueChange={setTime}
          className="border border-violet-200 bg-gradient-to-b from-violet-50 to-white"
        />
      </div>
    );
  },
};

// 시간대별 예시
export const TimeOfDay: Story = {
  render: () => {
    const [breakfast, setBreakfast] = useState("08:00");
    const [lunch, setLunch] = useState("12:30");
    const [dinner, setDinner] = useState("18:30");
    const [sleep, setSleep] = useState("23:00");

    return (
      <div className="space-y-6 p-6">
        <div>
          <h3 className="mb-2 text-sm font-semibold">🌅 아침 식사</h3>
          <p className="mb-2 text-xs text-gray-600">시간: {breakfast}</p>
          <TimePicker value={breakfast} onValueChange={setBreakfast} />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">🌞 점심 식사</h3>
          <p className="mb-2 text-xs text-gray-600">시간: {lunch}</p>
          <TimePicker value={lunch} onValueChange={setLunch} />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">🌆 저녁 식사</h3>
          <p className="mb-2 text-xs text-gray-600">시간: {dinner}</p>
          <TimePicker value={dinner} onValueChange={setDinner} />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">🌙 취침 시간</h3>
          <p className="mb-2 text-xs text-gray-600">시간: {sleep}</p>
          <TimePicker value={sleep} onValueChange={setSleep} />
        </div>
      </div>
    );
  },
};

// 실시간 포맷 변환
export const TimeFormatConversion: Story = {
  render: () => {
    const [time, setTime] = useState("14:30");

    const convertTo12Hour = (time24: string) => {
      const [h = 0, m = 0] = time24.split(":").map(Number);
      const period = h < 12 ? "오전" : "오후";
      const hour12 = h % 12 || 12;
      return `${period} ${hour12}:${String(m).padStart(2, "0")}`;
    };

    return (
      <div className="p-6">
        <div className="mb-4 space-y-2">
          <h3 className="text-sm font-semibold">시간 포맷 변환</h3>
          <div className="space-y-1 rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-600">24시간제: {time}</p>
            <p className="text-xs text-gray-600">12시간제: {convertTo12Hour(time)}</p>
          </div>
        </div>
        <TimePicker value={time} onValueChange={setTime} />
      </div>
    );
  },
};
