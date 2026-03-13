import { ChoiceBarChart } from "@/app/(site)/(main)/editor/missions/[missionId]/components/action-stats/ChoiceBarChart";
import type { ChoiceActionStats } from "@/types/dto/action-stats";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof ChoiceBarChart> = {
  title: "Mission/ActionStats/ChoiceBarChart",
  component: ChoiceBarChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# ChoiceBarChart

객관식(MULTIPLE_CHOICE), 태그(TAG), 분기(BRANCH) 액션의 응답 분포를 수평 바 차트로 표시합니다.

## 특징
- 내림차순 정렬
- count 라벨 표시
- Recharts BarChart (layout="vertical")
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockData = (overrides: Partial<ChoiceActionStats> = {}): ChoiceActionStats => ({
  actionId: "action-1",
  title: "좋아하는 프로그래밍 언어",
  actionType: "MULTIPLE_CHOICE",
  totalResponses: 120,
  type: "choice",
  options: [
    { label: "TypeScript", count: 45, percentage: 37.5 },
    { label: "Python", count: 32, percentage: 26.7 },
    { label: "Rust", count: 20, percentage: 16.7 },
    { label: "Go", count: 15, percentage: 12.5 },
    { label: "Java", count: 8, percentage: 6.7 },
  ],
  ...overrides,
});

export const Default: Story = {
  args: {
    data: createMockData(),
  },
  parameters: {
    docs: {
      description: {
        story: "5개 옵션이 있는 기본 객관식 통계입니다.",
      },
    },
  },
};

export const ManyOptions: Story = {
  args: {
    data: createMockData({
      title: "관심 분야 (복수 선택)",
      actionType: "TAG",
      totalResponses: 200,
      options: [
        { label: "IT/테크", count: 85, percentage: 42.5 },
        { label: "디자인", count: 60, percentage: 30.0 },
        { label: "마케팅", count: 52, percentage: 26.0 },
        { label: "금융", count: 45, percentage: 22.5 },
        { label: "교육", count: 38, percentage: 19.0 },
        { label: "헬스케어", count: 30, percentage: 15.0 },
        { label: "엔터테인먼트", count: 25, percentage: 12.5 },
        { label: "부동산", count: 18, percentage: 9.0 },
        { label: "물류", count: 12, percentage: 6.0 },
        { label: "농업", count: 5, percentage: 2.5 },
      ],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "10개 옵션이 있는 태그 통계입니다. 차트 높이가 데이터 수에 비례합니다.",
      },
    },
  },
};

export const TwoOptions: Story = {
  args: {
    data: createMockData({
      title: "다음 단계 선택",
      actionType: "BRANCH",
      totalResponses: 50,
      options: [
        { label: "A 코스", count: 32, percentage: 64.0 },
        { label: "B 코스", count: 18, percentage: 36.0 },
      ],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "분기(BRANCH) 타입으로 2개 선택지만 있는 경우입니다.",
      },
    },
  },
};

export const SingleOption: Story = {
  args: {
    data: createMockData({
      title: "참석 여부",
      totalResponses: 30,
      options: [{ label: "참석", count: 30, percentage: 100 }],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "옵션이 1개만 있는 경우입니다.",
      },
    },
  },
};

export const EvenDistribution: Story = {
  args: {
    data: createMockData({
      title: "선호 색상",
      totalResponses: 100,
      options: [
        { label: "빨강", count: 25, percentage: 25.0 },
        { label: "파랑", count: 25, percentage: 25.0 },
        { label: "초록", count: 25, percentage: 25.0 },
        { label: "노랑", count: 25, percentage: 25.0 },
      ],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "응답이 균등하게 분포된 경우입니다.",
      },
    },
  },
};

export const WithOtherOption: Story = {
  args: {
    data: createMockData({
      title: "직업",
      totalResponses: 80,
      options: [
        { label: "개발자", count: 35, percentage: 43.8 },
        { label: "디자이너", count: 20, percentage: 25.0 },
        { label: "기획자", count: 15, percentage: 18.8 },
        { label: "(기타: 프리랜서)", count: 6, percentage: 7.5 },
        { label: "(기타: 학생)", count: 4, percentage: 5.0 },
      ],
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "기타(직접입력) 응답이 포함된 경우입니다.",
      },
    },
  },
};

export const ZeroResponses: Story = {
  args: {
    data: createMockData({
      totalResponses: 0,
      options: [],
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
