import { MissionLikertScale } from "@/app/mission/[missionId]/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

const meta: Meta<typeof MissionLikertScale> = {
  title: "Mission/MissionLikertScale",
  component: MissionLikertScale,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# SurveyLikertScale

설문 질문에 대한 리커트 척도 컴포넌트입니다. 감정 이모지 썸네일을 사용하여 사용자의 응답을 직관적으로 표현합니다.

## 주요 기능

- 터치/드래그 인터랙션 지원
- min/max/step 값 커스터마이징 가능
- 1-5점 척도에 맞춘 감정 이모지 썸네일
- 선택적 척도 가이드 레이블
- 비활성화 상태 지원
- 반응형 및 모바일 친화적

## 합성 컴포넌트 구조

이 컴포넌트는 합성 패턴을 사용합니다:

- \`SurveyLikertScale\`: 메인 래퍼 컴포넌트
- \`SurveyLikertScale.ScaleGuide\`: 레이블 표시 (선택사항)
- \`SurveyLikertScale.Thumb\`: 감정 이모지 썸네일 (선택사항, 값에 따라 자동으로 아이콘 선택)

**참고:** \`SurveyLikertScale.Thumb\`를 제공하지 않으면 기본 원형 썸네일이 표시됩니다.

## 사용법

\`\`\`tsx
import { SurveyLikertScale } from "./components/SurveyLikertScale";

// 감정 이모지 썸네일 포함
function Example() {
  const [value, setValue] = useState(3);
  
  return (
    <SurveyLikertScale value={value} onChange={setValue}>
      <SurveyLikertScale.ScaleGuide 
        labels={["매우 나쁨", "나쁨", "보통", "좋음", "매우 좋음"]} 
      />
      <SurveyLikertScale.Thumb value={value} />
    </SurveyLikertScale>
  );
}

// 기본 원형 썸네일 (감정 이모지 제외)
function SimpleExample() {
  const [value, setValue] = useState(3);
  
  return (
    <SurveyLikertScale value={value} onChange={setValue}>
      <SurveyLikertScale.ScaleGuide labels={["1", "2", "3", "4", "5"]} />
    </SurveyLikertScale>
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

// 기본
export const Default: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] items-center justify-center p-8">
        <MissionLikertScale {...args} value={value} onChange={setValue}>
          <MissionLikertScale.Thumb value={value} />
        </MissionLikertScale>
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

// 기본 썸네일 (이모지 제외)
export const WithoutCustomThumb: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <MissionLikertScale {...args} value={value} onChange={setValue} />
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
  },
  parameters: {
    docs: {
      description: {
        story:
          "감정 이모지가 없는 기본 원형 썸네일입니다. `SurveyLikertScale.Thumb`를 자식으로 제공하지 않으면 단순한 원형 썸네일이 표시됩니다.",
      },
    },
  },
};

// 숫자 레이블
export const WithNumberLabels: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 1);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <MissionLikertScale value={value} onChange={setValue} min={1} max={5} step={1} />
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
  },
  parameters: {
    docs: {
      description: {
        story:
          "숫자 레이블과 기본 원형 썸네일을 사용합니다. 감정 이모지 없이 숫자 척도만 표시됩니다.",
      },
    },
  },
};

// 커스텀 색상
export const WithCustomColors: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <MissionLikertScale value={value} onChange={setValue} min={1} max={5} step={1}>
          <MissionLikertScale.Thumb value={value} className="text-sky-600" />
        </MissionLikertScale>
        <p className="text-sm text-zinc-600">선택된 값: {value} (커스텀 색상)</p>
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
  parameters: {
    docs: {
      description: {
        story:
          "Tailwind 색상 클래스를 사용하여 감정 이모지 썸네일 색상을 커스터마이징합니다. SVG 아이콘은 `currentColor`를 사용하므로 text-* 클래스로 스타일링할 수 있습니다.",
      },
    },
  },
};

// 7점 척도
export const SevenPointScale: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 4);
    return (
      <div className="flex min-h-[300px] w-[400px] flex-col items-center justify-center gap-4 p-8">
        <MissionLikertScale value={value} onChange={setValue} min={1} max={7} step={1}>
          <MissionLikertScale.Thumb value={value} />
        </MissionLikertScale>
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
  },
  parameters: {
    docs: {
      description: {
        story:
          "7점 척도 예시입니다. 참고: 감정 이모지 썸네일은 5점 척도에 맞춰 디자인되었으므로, 1-5 범위를 벗어난 값은 기본적으로 보통 표정으로 표시됩니다.",
      },
    },
  },
};

// 비활성화 상태
export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || 3);
    return (
      <div className="flex min-h-[300px] w-[400px] items-center justify-center p-8">
        <MissionLikertScale value={value} onChange={setValue} min={1} max={5} step={1} disabled>
          <MissionLikertScale.Thumb value={value} />
        </MissionLikertScale>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
    min: 1,
    max: 5,
    step: 1,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "비활성화 상태는 슬라이더와의 사용자 인터랙션을 방지합니다.",
      },
    },
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
        labels: ["매우 불만족", "불만족", "보통", "만족", "매우 만족"],
      },
      {
        id: "recommendation",
        question: "다른 사람에게 추천하시겠습니까?",
        labels: ["전혀 아님", "아님", "보통", "그렇다", "매우 그렇다"],
      },
      {
        id: "usability",
        question: "사용하기 쉬운가요?",
        labels: ["매우 어려움", "어려움", "보통", "쉬움", "매우 쉬움"],
      },
    ];

    return (
      <div className="flex min-h-[600px] w-[500px] flex-col gap-8 p-8">
        <h2 className="text-xl font-bold">설문 조사</h2>
        {questions.map(q => (
          <div key={q.id} className="flex flex-col gap-4">
            <h3 className="text-base font-medium">{q.question}</h3>
            <MissionLikertScale
              value={answers[q.id] ?? 3}
              onChange={value => setAnswers(prev => ({ ...prev, [q.id]: value }))}
              min={1}
              max={5}
              step={1}
            >
              <MissionLikertScale.Thumb value={answers[q.id] ?? 3} />
            </MissionLikertScale>
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
  parameters: {
    docs: {
      description: {
        story:
          "여러 개의 리커트 척도 질문이 포함된 완전한 설문 양식 예시입니다. 폼 컨텍스트에서 여러 응답을 관리하는 방법을 보여줍니다.",
      },
    },
  },
};

// 모바일 터치
export const MobileTouch: Story = {
  render: () => {
    const [value, setValue] = useState(3);
    return (
      <div className="flex min-h-[400px] w-full max-w-[400px] flex-col items-center justify-center gap-6 p-4">
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm font-medium text-blue-900">모바일에서 테스트해보세요!</p>
          <p className="mt-1 text-xs text-blue-700">
            썸네일을 터치하고 드래그하거나 트랙을 탭하세요
          </p>
        </div>
        <MissionLikertScale value={value} onChange={setValue} min={1} max={5} step={1}>
          <MissionLikertScale.Thumb value={value} />
        </MissionLikertScale>
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
    docs: {
      description: {
        story:
          "터치 인터랙션 테스트를 위한 모바일 최적화 뷰입니다. 슬라이더는 마우스와 터치 입력 모두에서 원활하게 작동합니다.",
      },
    },
  },
};

// 썸네일 갤러리
export const ThumbGallery: Story = {
  render: () => {
    return (
      <div className="flex min-h-[400px] w-[600px] flex-col gap-8 p-8">
        <h2 className="text-xl font-bold">썸네일 표정 갤러리</h2>
        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center gap-2">
            <MissionLikertScale.Thumb value={1} />
            <p className="text-sm text-zinc-600">매우 나쁨 (1)</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MissionLikertScale.Thumb value={2} />
            <p className="text-sm text-zinc-600">나쁨 (2)</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MissionLikertScale.Thumb value={3} />
            <p className="text-sm text-zinc-600">보통 (3)</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MissionLikertScale.Thumb value={4} />
            <p className="text-sm text-zinc-600">좋음 (4)</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MissionLikertScale.Thumb value={5} />
            <p className="text-sm text-zinc-600">매우 좋음 (5)</p>
          </div>
        </div>
      </div>
    );
  },
  args: {
    value: 3,
    onChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "5가지 감정 이모지 변형을 보여주는 갤러리입니다 (1=매우 나쁨, 2=나쁨, 3=보통, 4=좋음, 5=매우 좋음). 사용 가능한 썸네일 아이콘을 미리 보는 데 유용합니다.",
      },
    },
  },
};
