import { DateAndTimePicker } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

const meta: Meta<typeof DateAndTimePicker> = {
  title: "Common/DateAndTimePicker",
  component: DateAndTimePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# DateAndTimePicker

날짜와 시간을 함께 선택할 수 있는 **완전한 controlled 컴포넌트**입니다.

## 기본 사용법

\`\`\`tsx
import { useState } from "react";
import { DateAndTimePicker } from "@repo/ui/components";

function MyComponent() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("10:30");

  return (
    <DateAndTimePicker
      date={date}              // 필수
      time={time}              // 필수 (24시간 형식: "HH:mm")
      onDateChange={setDate}   // 필수
      onTimeChange={setTime}   // 필수
      disabled={false}         // 선택적 (기본값: false)
    />
  );
}
\`\`\`

## Jotai와 함께 사용

\`\`\`tsx
import { useAtom } from "jotai";
import { DateAndTimePicker } from "@repo/ui/components";

const dateAtom = atom<Date | undefined>(undefined);
const timeAtom = atom("10:30");

function MyComponent() {
  const [date, setDate] = useAtom(dateAtom);
  const [time, setTime] = useAtom(timeAtom);

  return (
    <DateAndTimePicker
      date={date}
      time={time}
      onDateChange={setDate}
      onTimeChange={setTime}
    />
  );
}
\`\`\`

## Props

### 필수 Props
- **date**: \`Date | undefined\` - 선택된 날짜
- **time**: \`string\` - 선택된 시간 (24시간 형식: "HH:mm", 예: "14:30")
- **onDateChange**: \`(date: Date | undefined) => void\` - 날짜 변경 콜백
- **onTimeChange**: \`(time: string) => void\` - 시간 변경 콜백

### 선택적 Props
- **disabled**: \`boolean\` - 컴포넌트 비활성화 여부 (기본값: false)

## 주요 기능

- **날짜 선택**: Drawer 기반 캘린더로 날짜 선택
- **시간 선택**: Swiper 기반 휠 스크롤러로 시간 선택 (12시간제 표시)
- **확인 버튼**: 선택 후 확인 버튼으로 적용
- **비활성화 지원**: disabled prop으로 모든 인터랙션 차단
- **모바일 최적화**: 터치 친화적인 UI
- **완전한 Controlled**: 외부에서 완전한 상태 제어
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
    const [time, setTime] = useState("10:30");

    return (
      <div style={{ padding: "20px" }}>
        <DateAndTimePicker date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />
      </div>
    );
  },
};

export const InForm: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState("14:00");

    return (
      <div style={{ padding: "40px", maxWidth: "500px" }}>
        <form className="space-y-4">
          <h3 className="mb-4 text-lg font-semibold">새 일정 만들기</h3>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">일정 제목</label>
            <input
              type="text"
              placeholder="일정 제목을 입력하세요"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">날짜 및 시간</label>
            <DateAndTimePicker
              date={date}
              time={time}
              onDateChange={setDate}
              onTimeChange={setTime}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
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
    const [startTime, setStartTime] = useState("09:00");
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [endTime, setEndTime] = useState("10:00");

    return (
      <div style={{ padding: "40px", maxWidth: "600px" }}>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">회의 일정 설정</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-medium text-gray-900">시작 시간</h4>
              <DateAndTimePicker
                date={startDate}
                time={startTime}
                onDateChange={setStartDate}
                onTimeChange={setStartTime}
              />
            </div>

            <div>
              <h4 className="mb-3 font-medium text-gray-900">종료 시간</h4>
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

export const Disabled: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState("14:30");

    return (
      <div style={{ padding: "20px" }}>
        <h3 className="mb-4 text-lg font-semibold">비활성화된 DateAndTimePicker</h3>
        <p className="mb-4 text-gray-600">
          disabled prop이 true일 때의 상태입니다. 클릭이나 입력이 불가능합니다.
        </p>
        <DateAndTimePicker
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
          disabled={true}
        />
      </div>
    );
  },
};

export const DisabledComparison: Story = {
  render: () => {
    const [enabledDate, setEnabledDate] = useState<Date | undefined>(new Date());
    const [enabledTime, setEnabledTime] = useState("10:00");
    const [disabledDate, setDisabledDate] = useState<Date | undefined>(new Date());
    const [disabledTime, setDisabledTime] = useState("14:30");

    return (
      <div style={{ padding: "40px", maxWidth: "800px" }}>
        <h3 className="mb-6 text-lg font-semibold">활성화 vs 비활성화 상태 비교</h3>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium text-gray-900">활성화 상태 (Normal)</h4>
            <p className="mb-3 text-sm text-gray-600">클릭과 입력이 가능한 일반 상태입니다.</p>
            <DateAndTimePicker
              date={enabledDate}
              time={enabledTime}
              onDateChange={setEnabledDate}
              onTimeChange={setEnabledTime}
              disabled={false}
            />
          </div>

          <div>
            <h4 className="mb-3 font-medium text-gray-900">비활성화 상태 (Disabled)</h4>
            <p className="mb-3 text-sm text-gray-600">
              disabled={true}로 설정된 상태입니다. 모든 인터랙션이 차단됩니다.
            </p>
            <DateAndTimePicker
              date={disabledDate}
              time={disabledTime}
              onDateChange={setDisabledDate}
              onTimeChange={setDisabledTime}
              disabled={true}
            />
          </div>
        </div>
      </div>
    );
  },
};
