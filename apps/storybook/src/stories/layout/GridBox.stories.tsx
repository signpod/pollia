import { GridBox } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";

// SurveyQuestionOptionButton과 유사한 Mock 컴포넌트
function MockOptionButton({
  title,
  description,
  selected = false,
}: {
  title: string;
  description?: string;
  selected?: boolean;
}) {
  const [isSelected, setIsSelected] = React.useState(selected);

  return (
    <button
      type="button"
      onClick={() => setIsSelected(!isSelected)}
      className={`
        flex justify-between items-start p-4 
        ring-1 ring-inset rounded-md
        hover:bg-zinc-50 transition-colors
        ${isSelected ? "ring-violet-500 bg-violet-50" : "ring-zinc-200"}
      `}
    >
      <div className="flex flex-col gap-1 text-left flex-1">
        <div className={`font-medium ${isSelected ? "text-violet-700" : "text-zinc-900"}`}>
          {title}
        </div>
        {description && (
          <div className={`text-sm ${isSelected ? "text-violet-600" : "text-zinc-500"}`}>
            {description}
          </div>
        )}
      </div>
      <div
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center
          ${isSelected ? "border-violet-500 bg-violet-500" : "border-zinc-300"}
        `}
      >
        {isSelected && (
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-label="선택됨"
          >
            <title>선택됨</title>
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </button>
  );
}

const meta: Meta<typeof GridBox> = {
  title: "Layout/GridBox",
  component: GridBox,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# GridBox

그리드 레이아웃을 위한 컨테이너 컴포넌트입니다.

## 사용법
\`\`\`tsx
<GridBox columns={2}>
  <YourComponent />
  <YourComponent />
</GridBox>
\`\`\`

## 특징
- columns prop으로 그리드 컬럼 수 지정
- 자동 gap spacing (gap-4)
- 반응형 레이아웃에 적합
`,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    columns: {
      control: { type: "select" },
      options: [1, 2, 3, 4, 5, 6],
      description: "그리드 컬럼 수",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "2" },
      },
    },
    children: {
      control: false,
      description: "그리드 안에 들어갈 자식 요소들",
    },
    className: {
      control: { type: "text" },
      description: "추가 CSS 클래스",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 2-column 그리드 레이아웃입니다.
 * 설문 옵션과 같은 선택지를 나열할 때 유용합니다.
 */
export const Default: Story = {
  args: {
    columns: 2,
    children: (
      <>
        <MockOptionButton title="옵션 1" description="첫 번째 선택지입니다" />
        <MockOptionButton title="옵션 2" description="두 번째 선택지입니다" />
        <MockOptionButton title="옵션 3" description="세 번째 선택지입니다" />
        <MockOptionButton title="옵션 4" description="네 번째 선택지입니다" />
      </>
    ),
  },
};

/**
 * 다양한 컬럼 수에 따른 그리드 레이아웃을 보여줍니다.
 * 1~6개의 컬럼으로 구성할 수 있습니다.
 */
export const Columns: Story = {
  render: () => (
    <div className="space-y-8 w-full">
      <div>
        <h3 className="mb-4 text-sm font-semibold text-zinc-700">1 Column</h3>
        <GridBox columns={1}>
          <MockOptionButton title="옵션 1" description="단일 컬럼 레이아웃" />
          <MockOptionButton title="옵션 2" description="모바일에 적합" />
          <MockOptionButton title="옵션 3" description="세로로 배치" />
        </GridBox>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-zinc-700">2 Columns (기본)</h3>
        <GridBox columns={2}>
          <MockOptionButton title="옵션 1" description="가장 일반적인 레이아웃" />
          <MockOptionButton title="옵션 2" description="태블릿에 적합" />
          <MockOptionButton title="옵션 3" description="균형잡힌 배치" />
          <MockOptionButton title="옵션 4" description="가독성 좋음" />
        </GridBox>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-zinc-700">3 Columns</h3>
        <GridBox columns={3}>
          <MockOptionButton title="옵션 1" />
          <MockOptionButton title="옵션 2" />
          <MockOptionButton title="옵션 3" />
          <MockOptionButton title="옵션 4" />
          <MockOptionButton title="옵션 5" />
          <MockOptionButton title="옵션 6" />
        </GridBox>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-zinc-700">4 Columns</h3>
        <GridBox columns={4}>
          <MockOptionButton title="옵션 1" />
          <MockOptionButton title="옵션 2" />
          <MockOptionButton title="옵션 3" />
          <MockOptionButton title="옵션 4" />
          <MockOptionButton title="옵션 5" />
          <MockOptionButton title="옵션 6" />
          <MockOptionButton title="옵션 7" />
          <MockOptionButton title="옵션 8" />
        </GridBox>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-zinc-700">5 Columns</h3>
        <GridBox columns={5}>
          <MockOptionButton title="옵션 1" />
          <MockOptionButton title="옵션 2" />
          <MockOptionButton title="옵션 3" />
          <MockOptionButton title="옵션 4" />
          <MockOptionButton title="옵션 5" />
          <MockOptionButton title="옵션 6" />
          <MockOptionButton title="옵션 7" />
          <MockOptionButton title="옵션 8" />
          <MockOptionButton title="옵션 9" />
          <MockOptionButton title="옵션 10" />
        </GridBox>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-zinc-700">6 Columns</h3>
        <GridBox columns={6}>
          <MockOptionButton title="옵션 1" />
          <MockOptionButton title="옵션 2" />
          <MockOptionButton title="옵션 3" />
          <MockOptionButton title="옵션 4" />
          <MockOptionButton title="옵션 5" />
          <MockOptionButton title="옵션 6" />
          <MockOptionButton title="옵션 7" />
          <MockOptionButton title="옵션 8" />
          <MockOptionButton title="옵션 9" />
          <MockOptionButton title="옵션 10" />
          <MockOptionButton title="옵션 11" />
          <MockOptionButton title="옵션 12" />
        </GridBox>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "컬럼 수에 따라 레이아웃이 어떻게 변하는지 보여줍니다. 콘텐츠의 양과 화면 크기에 따라 적절한 컬럼 수를 선택하세요.",
      },
    },
  },
};

/**
 * 다양한 콘텐츠 길이를 가진 옵션들을 보여줍니다.
 * 텍스트 길이가 다를 때도 일관된 레이아웃을 유지합니다.
 */
export const WithDifferentContentLengths: Story = {
  render: () => (
    <GridBox columns={2}>
      <MockOptionButton title="짧은 제목" description="간단한 설명" />
      <MockOptionButton
        title="조금 더 긴 제목을 가진 옵션"
        description="이 옵션은 더 긴 설명을 가지고 있어서 텍스트가 여러 줄로 표시될 수 있습니다"
      />
      <MockOptionButton title="중간 길이 제목" />
      <MockOptionButton
        title="매우 긴 제목을 가진 옵션으로 여러 줄로 표시될 수 있습니다"
        description="설명도 함께 있는 경우"
      />
    </GridBox>
  ),
  parameters: {
    docs: {
      description: {
        story: "콘텐츠 길이가 다양할 때도 GridBox가 일관된 레이아웃을 유지하는 것을 보여줍니다.",
      },
    },
  },
};

/**
 * 인터랙티브하게 컬럼 수를 변경할 수 있는 예시입니다.
 * Controls 패널에서 columns 값을 변경해보세요.
 */
export const Interactive: Story = {
  render: (args: { columns?: number }) => {
    const [columns, setColumns] = React.useState(args.columns || 2);

    return (
      <div className="space-y-4">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-sm font-medium text-zinc-700">컬럼 수 선택:</span>
          {[1, 2, 3, 4, 5, 6].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => setColumns(num)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  columns === num
                    ? "bg-violet-500 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>

        <GridBox columns={columns}>
          <MockOptionButton title="옵션 1" description="첫 번째 옵션" selected />
          <MockOptionButton title="옵션 2" description="두 번째 옵션" />
          <MockOptionButton title="옵션 3" description="세 번째 옵션" />
          <MockOptionButton title="옵션 4" description="네 번째 옵션" />
          <MockOptionButton title="옵션 5" description="다섯 번째 옵션" />
          <MockOptionButton title="옵션 6" description="여섯 번째 옵션" />
          <MockOptionButton title="옵션 7" description="일곱 번째 옵션" />
          <MockOptionButton title="옵션 8" description="여덟 번째 옵션" />
          <MockOptionButton title="옵션 9" description="아홉 번째 옵션" />
          <MockOptionButton title="옵션 10" description="열 번째 옵션" />
          <MockOptionButton title="옵션 11" description="열한 번째 옵션" />
          <MockOptionButton title="옵션 12" description="열두 번째 옵션" />
        </GridBox>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "버튼을 클릭하여 실시간으로 그리드 컬럼 수를 변경할 수 있습니다.",
      },
    },
  },
};

/**
 * 실제 설문 시나리오를 시뮬레이션한 예시입니다.
 */
export const SurveyScenario: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-zinc-900">선호하는 음료 종류를 선택해주세요</h2>
        <p className="text-sm text-zinc-600">하나 또는 여러 개를 선택할 수 있습니다</p>
      </div>

      <GridBox columns={2}>
        <MockOptionButton title="커피" description="에스프레소, 아메리카노, 라떼 등" />
        <MockOptionButton title="차" description="녹차, 홍차, 허브티 등" />
        <MockOptionButton title="주스" description="과일 주스, 야채 주스 등" />
        <MockOptionButton title="탄산음료" description="콜라, 사이다, 탄산수 등" />
        <MockOptionButton title="우유" description="일반 우유, 두유, 아몬드 우유 등" />
        <MockOptionButton title="기타" description="스무디, 에너지 드링크 등" />
      </GridBox>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "실제 설문조사에서 사용되는 형태의 예시입니다. GridBox를 활용하여 선택지를 깔끔하게 배치했습니다.",
      },
    },
  },
};
