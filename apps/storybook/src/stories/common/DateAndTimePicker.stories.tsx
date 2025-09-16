import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { DateAndTimePicker } from "@repo/ui/components";

const meta: Meta<typeof DateAndTimePicker> = {
  title: "Common/DateAndTimePicker",
  component: DateAndTimePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# DateAndTimePicker

날짜와 시간을 함께 선택할 수 있는 **완전한 controlled 컴포넌트**입니다. 모든 props가 필수입니다.

## 기본 사용법

\`\`\`tsx
import { useState } from "react";
import { DateAndTimePicker } from "@repo/ui/components";

function MyComponent() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("10:30:00");

  return (
    <DateAndTimePicker
      date={date}              // 필수
      time={time}              // 필수  
      onDateChange={setDate}   // 필수
      onTimeChange={setTime}   // 필수
    />
  );
}
\`\`\`

## Jotai와 함께 사용

\`\`\`tsx
import { useAtom } from "jotai";
import { DateAndTimePicker } from "@repo/ui/components";

const dateAtom = atom<Date | undefined>(undefined);
const timeAtom = atom("10:30:00");

function MyComponent() {
  const [date, setDate] = useAtom(dateAtom);
  const [time, setTime] = useAtom(timeAtom);

  return (
    <DateAndTimePicker
      date={date}              // 필수
      time={time}              // 필수
      onDateChange={setDate}   // 필수
      onTimeChange={setTime}   // 필수
    />
  );
}
\`\`\`

## Props (모두 필수)

- **date**: \`Date | undefined\` - 선택된 날짜 (필수)
- **time**: \`string\` - 선택된 시간 (HH:mm:ss 형식, 필수)
- **onDateChange**: \`(date: Date | undefined) => void\` - 날짜 변경 콜백 (필수)
- **onTimeChange**: \`(time: string) => void\` - 시간 변경 콜백 (필수)

## 주요 기능

- **날짜 선택**: 팝오버 캘린더로 날짜 선택
- **시간 선택**: HTML time input으로 시:분:초 입력
- **접근성**: 라벨과 키보드 네비게이션 지원
- **완전한 Controlled**: 모든 props 필수, 외부에서 완전한 상태 제어
- **타입 안전성**: TypeScript로 필수 props 강제`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState("10:30:00");

    return (
      <div style={{ padding: "20px" }}>
        <DateAndTimePicker
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
        />
      </div>
    );
  },
};

export const InForm: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState("14:00:00");

    return (
      <div style={{ padding: "40px", maxWidth: "500px" }}>
        <form className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">새 일정 만들기</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              일정 제목
            </label>
            <input
              type="text"
              placeholder="일정 제목을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜 및 시간
            </label>
            <DateAndTimePicker
              date={date}
              time={time}
              onDateChange={setDate}
              onTimeChange={setTime}
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            일정 저장
          </button>
        </form>
      </div>
    );
  },
};

export const StartEndTime: Story = {
  render: () => {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [startTime, setStartTime] = useState("09:00:00");
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [endTime, setEndTime] = useState("10:00:00");

    return (
      <div style={{ padding: "40px", maxWidth: "600px" }}>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">회의 일정 설정</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">시작 시간</h4>
              <DateAndTimePicker
                date={startDate}
                time={startTime}
                onDateChange={setStartDate}
                onTimeChange={setStartTime}
              />
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">종료 시간</h4>
              <DateAndTimePicker
                date={endDate}
                time={endTime}
                onDateChange={setEndDate}
                onTimeChange={setEndTime}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
};
