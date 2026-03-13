import { ScaleDistributionChart } from "@/app/(site)/(main)/editor/missions/[missionId]/components/action-stats/ScaleDistributionChart";
import type { ScaleActionStats } from "@/types/dto/action-stats";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof ScaleDistributionChart> = {
  title: "Mission/ActionStats/ScaleDistributionChart",
  component: ScaleDistributionChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# ScaleDistributionChart

척도형(SCALE), 별점(RATING) 액션의 점수 분포를 바 차트로 표시합니다.

## 특징
- 점수별 분포 바 차트
- 하단 통계 카드 (평균, 중앙값, 최솟값, 최댓값)
- Recharts BarChart + Tooltip
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockData = (overrides: Partial<ScaleActionStats> = {}): ScaleActionStats => ({
  actionId: "action-1",
  title: "만족도 평가",
  actionType: "SCALE",
  totalResponses: 100,
  type: "scale",
  distribution: [
    { score: 1, count: 5 },
    { score: 2, count: 10 },
    { score: 3, count: 25 },
    { score: 4, count: 35 },
    { score: 5, count: 25 },
  ],
  mean: 3.65,
  median: 4,
  min: 1,
  max: 5,
  ...overrides,
});

export const Default: Story = {
  args: {
    data: createMockData(),
  },
  parameters: {
    docs: {
      description: {
        story: "1~5점 척도의 기본 만족도 평가입니다.",
      },
    },
  },
};

export const Rating: Story = {
  args: {
    data: createMockData({
      title: "서비스 별점",
      actionType: "RATING",
      totalResponses: 50,
      distribution: [
        { score: 1, count: 2 },
        { score: 2, count: 3 },
        { score: 3, count: 8 },
        { score: 4, count: 17 },
        { score: 5, count: 20 },
      ],
      mean: 4.0,
      median: 4,
      min: 1,
      max: 5,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "RATING 타입의 별점 분포입니다. 높은 점수에 응답이 집중되어 있습니다.",
      },
    },
  },
};

export const WideRange: Story = {
  args: {
    data: createMockData({
      title: "온도 선호도 (0~100)",
      totalResponses: 60,
      distribution: [
        { score: 10, count: 2 },
        { score: 20, count: 5 },
        { score: 30, count: 8 },
        { score: 40, count: 12 },
        { score: 50, count: 15 },
        { score: 60, count: 10 },
        { score: 70, count: 5 },
        { score: 80, count: 2 },
        { score: 90, count: 1 },
      ],
      mean: 47.5,
      median: 50,
      min: 10,
      max: 90,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "넓은 범위의 점수 분포입니다.",
      },
    },
  },
};

export const SkewedLeft: Story = {
  args: {
    data: createMockData({
      title: "난이도 평가",
      totalResponses: 80,
      distribution: [
        { score: 1, count: 30 },
        { score: 2, count: 25 },
        { score: 3, count: 15 },
        { score: 4, count: 7 },
        { score: 5, count: 3 },
      ],
      mean: 1.85,
      median: 2,
      min: 1,
      max: 5,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "낮은 점수에 응답이 집중된 좌편향 분포입니다.",
      },
    },
  },
};

export const AllSameScore: Story = {
  args: {
    data: createMockData({
      title: "동의 수준",
      totalResponses: 40,
      distribution: [{ score: 5, count: 40 }],
      mean: 5,
      median: 5,
      min: 5,
      max: 5,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "모든 응답이 동일한 점수인 경우입니다.",
      },
    },
  },
};

export const SingleResponse: Story = {
  args: {
    data: createMockData({
      title: "첫 번째 평가",
      totalResponses: 1,
      distribution: [{ score: 3, count: 1 }],
      mean: 3,
      median: 3,
      min: 3,
      max: 3,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "응답이 1건뿐인 경우입니다.",
      },
    },
  },
};

export const ZeroResponses: Story = {
  args: {
    data: createMockData({
      totalResponses: 0,
      distribution: [],
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "응답이 없는 경우 빈 상태를 표시합니다.",
      },
    },
  },
};
