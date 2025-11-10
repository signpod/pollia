import { LikertScale, type ScaleThumbProps } from "@/app/survey/[id]/components/LikertScale";
import type { Meta, StoryObj } from "@storybook/react";
import { Frown, Heart, Meh, Smile } from "lucide-react";
import { useState } from "react";

const meta = {
  title: "Survey/LikertScale",
  component: LikertScale,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 1, max: 5, step: 1 },
      description: "현재 선택된 값",
      table: {
        type: { summary: "number" },
      },
    },
    onChange: {
      description: "값 변경 시 호출되는 콜백 함수",
      table: {
        type: { summary: "(value: number) => void" },
      },
    },
    min: {
      control: "number",
      description: "최소값",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    max: {
      control: "number",
      description: "최대값",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "5" },
      },
    },
    step: {
      control: "number",
      description: "증감 단위",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    labels: {
      control: "object",
      description: "스케일 가이드 라벨 배열",
      table: {
        type: { summary: "string[]" },
      },
    },
    scaleThumb: {
      description: "커스텀 Thumb 컴포넌트",
      table: {
        type: { summary: "React.ComponentType<ScaleThumbProps>" },
      },
    },
    disabled: {
      control: "boolean",
      description: "비활성화 여부",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
} satisfies Meta<typeof LikertScale>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 스토리
export const Default: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] items-center justify-center p-8">
        <LikertScale {...args} value={value} onChange={setValue} />
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
  },
};

// 숫자 라벨
export const WithNumberLabels: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 1);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <LikertScale {...args} value={value} onChange={setValue} />
        <p className="text-sm text-zinc-600">선택된 값: {value}</p>
      </div>
    );
  },
  args: {
    value: 1,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
    labels: ["1", "2", "3", "4", "5"],
  },
};

// 텍스트 라벨
export const WithTextLabels: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <LikertScale {...args} value={value} onChange={setValue} />
        <p className="text-sm text-zinc-600">선택된 값: {value}</p>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
    labels: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"],
  },
};

// 커스텀 Scale Thumb
const CustomEmojiThumb: React.FC<ScaleThumbProps> = ({ value }) => {
  const getEmoji = () => {
    if (value <= 2) return { icon: Frown, color: "text-red-500" };
    if (value === 3) return { icon: Meh, color: "text-yellow-500" };
    return { icon: Smile, color: "text-green-500" };
  };

  const { icon: Icon, color } = getEmoji();

  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-violet-500">
      <Icon className={`size-5 ${color}`} />
    </div>
  );
};

export const WithCustomThumb: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <LikertScale {...args} value={value} onChange={setValue} scaleThumb={CustomEmojiThumb} />
        <p className="text-sm text-zinc-600">선택된 값: {value} (이모지가 바뀝니다!)</p>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
    labels: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"],
  },
};

// 7점 척도
export const SevenPointScale: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 4);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <LikertScale {...args} value={value} onChange={setValue} />
        <p className="text-sm text-zinc-600">선택된 값: {value} / 7</p>
      </div>
    );
  },
  args: {
    value: 4,
    onChange: () => {},
    min: 1,
    max: 7,
    step: 1,
    labels: ["1", "2", "3", "4", "5", "6", "7"],
  },
};

// 비활성화
export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] items-center justify-center p-8">
        <LikertScale {...args} value={value} onChange={setValue} />
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
    labels: ["1", "2", "3", "4", "5"],
    disabled: true,
  },
};

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => {
    const [answers, setAnswers] = useState<Record<string, number>>({
      satisfaction: 3,
      recommendation: 3,
      usability: 3,
    });

    const questions = [
      {
        id: "satisfaction",
        question: "서비스에 얼마나 만족하시나요?",
        labels: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"],
      },
      {
        id: "recommendation",
        question: "다른 사람에게 추천하시겠습니까?",
        labels: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"],
      },
      {
        id: "usability",
        question: "사용하기 쉬운가요?",
        labels: ["매우 어렵다", "어렵다", "보통이다", "쉽다", "매우 쉽다"],
      },
    ];

    return (
      <div className="flex min-h-[600px] w-[500px] flex-col gap-8 p-8">
        <h2 className="text-xl font-bold">설문조사</h2>
        {questions.map(q => (
          <div key={q.id} className="flex flex-col gap-4">
            <h3 className="text-base font-medium">{q.question}</h3>
            <LikertScale
              value={answers[q.id] ?? 3}
              onChange={value => setAnswers(prev => ({ ...prev, [q.id]: value }))}
              min={1}
              max={5}
              step={1}
              labels={q.labels}
            />
          </div>
        ))}
        <div className="mt-4 rounded-lg bg-zinc-100 p-4">
          <h4 className="mb-2 font-semibold">응답 결과:</h4>
          <pre className="text-sm">{JSON.stringify(answers, null, 2)}</pre>
        </div>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
  },
};

// 모바일 터치 테스트
export const MobileTouch: Story = {
  render: () => {
    const [value, setValue] = useState(3);
    return (
      <div className="flex min-h-[400px] w-full max-w-[400px] flex-col items-center justify-center gap-6 p-4">
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm font-medium text-blue-900">모바일에서 테스트해보세요!</p>
          <p className="mt-1 text-xs text-blue-700">
            Thumb을 터치하여 드래그하거나 트랙을 탭하세요
          </p>
        </div>
        <LikertScale
          value={value}
          onChange={setValue}
          labels={["매우 나쁨", "나쁨", "보통", "좋음", "매우 좋음"]}
        />
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl font-bold text-violet-600">{value}</p>
          <p className="text-sm text-zinc-500">선택된 값</p>
        </div>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

// 하트 아이콘 Thumb
const HeartThumb: React.FC<ScaleThumbProps> = ({ value }) => {
  const getHeartColor = () => {
    if (value <= 2) return "text-zinc-400";
    if (value === 3) return "text-pink-300";
    return "text-pink-500";
  };

  const isFilled = value >= 4;

  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-pink-500">
      <Heart className={`size-5 ${getHeartColor()} ${isFilled ? "fill-current" : ""}`} />
    </div>
  );
};

export const WithHeartThumb: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 1);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <LikertScale {...args} value={value} onChange={setValue} scaleThumb={HeartThumb} />
        <p className="text-sm text-zinc-600">선택된 값: {value} (하트가 채워집니다!)</p>
      </div>
    );
  },
  args: {
    value: 1,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
    labels: ["1", "2", "3", "4", "5"],
  },
};
