import { RatingScale } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

const meta: Meta<typeof RatingScale> = {
  title: "Common/RatingScale",
  component: RatingScale,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `# RatingScale

평가 척도를 위한 슬라이더 컴포넌트입니다. 옵션의 개수와 방향에 따라 자동으로 레이아웃이 조정됩니다.

## 주요 기능

- 수평/수직 방향 지원
- 옵션 배열을 통한 커스텀 레이블 표시
- min/max/step 값 커스터마이징 가능
- 옵션 개수에 따른 자동 레이아웃 조정 (3개, 4개, 5개)
- 옵션 개수에 따른 자동 줄바꿈 글자수 조정
  - 3개 옵션: title이 6글자부터 줄바꿈
  - 4개 옵션: title이 4글자부터 줄바꿈
  - 5개 옵션: title이 3글자부터 줄바꿈
- 비활성화 상태 지원
- 터치/드래그 인터랙션 지원

## 사용법

\`\`\`tsx
import { RatingScale } from "@repo/ui/components";

// 기본 사용 (숫자 범위)
function BasicExample() {
  const [value, setValue] = useState(3);
  
  return (
    <RatingScale 
      value={value} 
      onChange={setValue}
      min={1}
      max={5}
      step={1}
    />
  );
}

// 옵션 배열 사용
function WithOptionsExample() {
  const [value, setValue] = useState(2);
  
  const options = [
    { title: "매우 나쁨", order: 1 },
    { title: "나쁨", order: 2 },
    { title: "보통", order: 3 },
    { title: "좋음", order: 4 },
    { title: "매우 좋음", order: 5 },
  ];
  
  return (
    <RatingScale 
      value={value} 
      onChange={setValue}
      options={options}
    />
  );
}

// 수직 방향 (옵션이 6개 이상이거나 order가 있을 때 자동으로 수직 레이아웃)
function VerticalExample() {
  const [value, setValue] = useState(3);
  
  return (
    <div style={{ height: "400px" }}>
      <RatingScale 
        value={value} 
        onChange={setValue}
        options={[
          { title: "매우 나쁨", order: 1 },
          { title: "나쁨", order: 2 },
          { title: "보통", order: 3 },
          { title: "좋음", order: 4 },
          { title: "매우 좋음", order: 5 },
          { title: "완벽함", order: 6 },
        ]}
      />
    </div>
  );
}
\`\`\`
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "number" },
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
    options: {
      control: "object",
      description: "옵션 배열 (title과 order 포함)",
      table: {
        type: { summary: "RatingScaleOption[]" },
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
      description: "증가 단위",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[200px] w-[600px] flex-col items-center justify-center gap-4 p-8">
        <RatingScale {...args} value={value} onChange={setValue} />
        <p className="text-sm text-zinc-600">선택된 값: {value}</p>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
    options: [
      { id: "1", title: "1점", order: 0 },
      { id: "2", title: "2점", order: 1 },
      { id: "3", title: "3점", order: 2 },
      { id: "4", title: "4점", order: 3 },
      { id: "5", title: "5점", order: 4 },
    ],
  },
};

export const WithOptions: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[200px] w-[600px] flex-col items-center justify-center gap-4 p-8">
        <RatingScale {...args} value={value} onChange={setValue} />
        <p className="text-sm text-zinc-600">선택된 값: {value}</p>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
    options: [
      { id: "1", title: "매우 나쁨", order: 1 },
      { id: "2", title: "나쁨", order: 2 },
      { id: "3", title: "보통", order: 3 },
      { id: "4", title: "좋음", order: 4 },
      { id: "5", title: "매우 좋음", order: 5 },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "옵션 배열을 사용하여 각 위치에 레이블을 표시합니다. title과 order를 함께 사용할 수 있습니다.",
      },
    },
  },
};

export const ThreeOptions: Story = {
  render: () => {
    const [value, setValue] = useState(2);
    return (
      <div className="flex min-h-[200px] w-[600px] flex-col items-center justify-center gap-4 p-8">
        <RatingScale
          value={value}
          onChange={setValue}
          options={[
            { id: "1", title: "매우 낮음", order: 1 },
            { id: "2", title: "보통", order: 2 },
            { id: "3", title: "매우 높음", order: 3 },
          ]}
        />
        <p className="text-sm text-zinc-600">선택된 값: {value}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "3개 옵션을 사용하는 경우입니다. title이 6글자부터 줄바꿈됩니다.",
      },
    },
  },
};

export const FourOptions: Story = {
  render: () => {
    const [value, setValue] = useState(2);
    return (
      <div className="flex min-h-[200px] w-[600px] flex-col items-center justify-center gap-4 p-8">
        <RatingScale
          value={value}
          onChange={setValue}
          options={[
            { id: "1", title: "1점", order: 1 },
            { id: "2", title: "2점", order: 2 },
            { id: "3", title: "3점", order: 3 },
            { id: "4", title: "4점", order: 4 },
          ]}
        />
        <p className="text-sm text-zinc-600">선택된 값: {value}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "4개 옵션을 사용하는 경우입니다. title이 4글자부터 줄바꿈됩니다.",
      },
    },
  },
};

export const FiveOptions: Story = {
  render: () => {
    const [value, setValue] = useState(3);
    return (
      <div className="flex min-h-[200px] w-[600px] flex-col items-center justify-center gap-4 p-8">
        <RatingScale
          value={value}
          onChange={setValue}
          options={[
            { id: "1", title: "매나쁨", order: 1 },
            { id: "2", title: "나쁨", order: 2 },
            { id: "3", title: "보통", order: 3 },
            { id: "4", title: "좋음", order: 4 },
            { id: "5", title: "매우", order: 5 },
          ]}
        />
        <p className="text-sm text-zinc-600">선택된 값: {value}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "5개 옵션을 사용하는 경우입니다. title이 3글자부터 줄바꿈됩니다.",
      },
    },
  },
};

export const Vertical: Story = {
  render: () => {
    const [value, setValue] = useState(3);
    return (
      <div className="flex min-h-[400px] w-[200px] items-center justify-center p-8">
        <RatingScale
          value={value}
          onChange={setValue}
          options={[
            { id: "1", title: "매우 나쁨", order: 1 },
            { id: "2", title: "나쁨", order: 2 },
            { id: "3", title: "보통", order: 3 },
            { id: "4", title: "좋음", order: 4 },
            { id: "5", title: "매우 좋음", order: 5 },
            { id: "6", title: "완벽함", order: 6 },
          ]}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "수직 방향으로 표시되는 슬라이더입니다. 옵션이 5개를 초과하거나 order 속성이 있으면 자동으로 수직 레이아웃으로 전환됩니다.",
      },
    },
  },
};

export const VerticalWithDescription: Story = {
  render: () => {
    const [value, setValue] = useState(3);
    return (
      <div className="flex min-h-[400px] w-[600px] items-center justify-center p-8">
        <RatingScale
          value={value}
          onChange={setValue}
          options={[
            { id: "1", title: "1점", description: "매우 나쁨", order: 1 },
            { id: "2", title: "2점", description: "나쁨", order: 2 },
            { id: "3", title: "3점", description: "보통", order: 3 },
            { id: "4", title: "4점", description: "좋음", order: 4 },
            { id: "5", title: "5점", description: "매우 좋음", order: 5 },
          ]}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "수직 방향에 옵션 레이블이 포함된 슬라이더입니다. order 속성이 있으면 자동으로 수직 레이아웃으로 전환됩니다.",
      },
    },
  },
};

export const CustomRange: Story = {
  render: () => {
    const [value, setValue] = useState(5);
    return (
      <div className="flex min-h-[800px] w-[800px] flex-col items-center justify-center gap-4 p-8">
        <RatingScale value={value} onChange={setValue} min={0} max={10} step={1} options={[]} />
        <p className="text-sm text-zinc-600">선택된 값: {value} (0-10 범위)</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "커스텀 범위를 사용하는 예시입니다. min과 max 값을 자유롭게 설정할 수 있습니다.",
      },
    },
  },
};

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState(3);
    return (
      <div className="flex min-h-[200px] w-[600px] items-center justify-center p-8">
        <RatingScale
          value={value}
          onChange={setValue}
          min={1}
          max={5}
          step={1}
          disabled
          options={[]}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "비활성화 상태는 슬라이더와의 사용자 인터랙션을 방지합니다.",
      },
    },
  },
};

export const WithoutOrder: Story = {
  render: () => {
    const [value, setValue] = useState(1);
    return (
      <div className="flex min-h-[200px] w-[600px] flex-col items-center justify-center gap-4 p-8">
        <RatingScale
          value={value}
          onChange={setValue}
          options={[
            { id: "1", title: "전혀 아님", order: 1 },
            { id: "2", title: "아님", order: 2 },
            { id: "3", title: "보통", order: 3 },
            { id: "4", title: "그렇다", order: 4 },
            { id: "5", title: "매우 그렇다", order: 5 },
          ]}
        />
        <p className="text-sm text-zinc-600">선택된 값: {value}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "order 없이 title만 사용하는 경우입니다. 옵션은 배열 순서대로 배치됩니다.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => {
    const [answers, setAnswers] = useState<Record<string, number>>({
      satisfaction: 3,
      quality: 3,
      recommendation: 3,
    });

    const questions = [
      {
        id: "satisfaction",
        question: "서비스에 얼마나 만족하시나요?",
        options: [
          { title: "매우 불만족", order: 1 },
          { title: "불만족", order: 2 },
          { title: "보통", order: 3 },
          { title: "만족", order: 4 },
          { title: "매우 만족", order: 5 },
        ],
      },
      {
        id: "quality",
        question: "서비스 품질은 어떠신가요?",
        options: [
          { title: "매우 나쁨", order: 1 },
          { title: "나쁨", order: 2 },
          { title: "보통", order: 3 },
          { title: "좋음", order: 4 },
          { title: "매우 좋음", order: 5 },
        ],
      },
      {
        id: "recommendation",
        question: "다른 사람에게 추천하시겠습니까?",
        options: [
          { title: "전혀 아님", order: 1 },
          { title: "아님", order: 2 },
          { title: "보통", order: 3 },
          { title: "그렇다", order: 4 },
          { title: "매우 그렇다", order: 5 },
        ],
      },
    ];

    return (
      <div className="flex min-h-[600px] w-[600px] flex-col gap-8 p-8">
        <h2 className="text-xl font-bold">설문 조사</h2>
        {questions.map(q => (
          <div key={q.id} className="flex flex-col gap-4">
            <h3 className="text-base font-medium">{q.question}</h3>
            <RatingScale
              value={answers[q.id] ?? 3}
              onChange={value => setAnswers(prev => ({ ...prev, [q.id]: value }))}
              options={q.options.map(o => ({ ...o, id: o.title }))}
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
  parameters: {
    docs: {
      description: {
        story:
          "여러 개의 평가 척도 질문이 포함된 완전한 설문 양식 예시입니다. 폼 컨텍스트에서 여러 응답을 관리하는 방법을 보여줍니다.",
      },
    },
  },
};
