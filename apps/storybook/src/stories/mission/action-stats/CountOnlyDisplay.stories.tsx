import { CountOnlyDisplay } from "@/app/(site)/(main)/editor/missions/[missionId]/components/action-stats/CountOnlyDisplay";
import type { CountOnlyActionStats } from "@/types/dto/action-stats";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof CountOnlyDisplay> = {
  title: "Mission/ActionStats/CountOnlyDisplay",
  component: CountOnlyDisplay,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# CountOnlyDisplay

파일(IMAGE, VIDEO, PDF), 날짜(DATE), 시간(TIME) 등 차트로 표현하기 어려운 액션의 응답 수만 표시합니다.
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockData = (overrides: Partial<CountOnlyActionStats> = {}): CountOnlyActionStats => ({
  actionId: "action-1",
  title: "사진 업로드",
  actionType: "IMAGE",
  totalResponses: 45,
  type: "count",
  ...overrides,
});

export const Default: Story = {
  args: {
    data: createMockData(),
  },
  parameters: {
    docs: {
      description: {
        story: "이미지 업로드 액션의 응답 수를 표시합니다.",
      },
    },
  },
};

export const Video: Story = {
  args: {
    data: createMockData({
      title: "영상 제출",
      actionType: "VIDEO",
      totalResponses: 12,
    }),
  },
};

export const PDF: Story = {
  args: {
    data: createMockData({
      title: "서류 제출",
      actionType: "PDF",
      totalResponses: 30,
    }),
  },
};

export const DateAction: Story = {
  args: {
    data: createMockData({
      title: "참여 가능 날짜",
      actionType: "DATE",
      totalResponses: 60,
    }),
  },
};

export const TimeAction: Story = {
  args: {
    data: createMockData({
      title: "선호 시간대",
      actionType: "TIME",
      totalResponses: 55,
    }),
  },
};

export const LargeCount: Story = {
  args: {
    data: createMockData({
      title: "인증 사진",
      totalResponses: 1234,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "많은 응답 수가 표시되는 경우입니다.",
      },
    },
  },
};

export const SingleResponse: Story = {
  args: {
    data: createMockData({
      totalResponses: 1,
    }),
  },
};

export const ZeroResponses: Story = {
  args: {
    data: createMockData({
      totalResponses: 0,
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
