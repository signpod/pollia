import { CountOnlyDisplay } from "@/app/(site)/(main)/editor/missions/[missionId]/components/action-stats/CountOnlyDisplay";
import { TextResponseList } from "@/app/(site)/(main)/editor/missions/[missionId]/components/action-stats/TextResponseList";
import type {
  ActionStatItem,
  ChoiceActionStats,
  CountOnlyActionStats,
  ScaleActionStats,
  TextActionStats,
} from "@/types/dto/action-stats";
import type { Meta, StoryObj } from "@storybook/nextjs";
import dynamic from "next/dynamic";

const ChoiceBarChart = dynamic(
  () =>
    import(
      "@/app/(site)/(main)/editor/missions/[missionId]/components/action-stats/ChoiceBarChart"
    ).then(m => ({ default: m.ChoiceBarChart })),
  { ssr: false },
);
const ScaleDistributionChart = dynamic(
  () =>
    import(
      "@/app/(site)/(main)/editor/missions/[missionId]/components/action-stats/ScaleDistributionChart"
    ).then(m => ({ default: m.ScaleDistributionChart })),
  { ssr: false },
);

const mockChoice: ChoiceActionStats = {
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
};

const mockScale: ScaleActionStats = {
  actionId: "action-2",
  title: "만족도 평가 (1~5)",
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
};

const mockText: TextActionStats = {
  actionId: "action-3",
  title: "개선 사항을 자유롭게 적어주세요",
  actionType: "SUBJECTIVE",
  totalResponses: 12,
  type: "text",
  samples: [
    "UI가 깔끔하고 사용하기 편리합니다.",
    "로딩 속도가 좀 더 빨라졌으면 좋겠습니다.",
    "다크 모드 지원이 있으면 좋겠어요.",
    "모바일에서도 잘 작동합니다.",
    "전체적으로 만족합니다. 알림 기능이 추가되면 더 좋을 것 같아요.",
    "검색 기능이 더 정교해졌으면 합니다.",
    "가격 대비 훌륭한 서비스입니다.",
    "고객 지원이 빠르고 친절했습니다.",
    "튜토리얼이 있으면 좋겠습니다.",
    "대시보드가 한눈에 보기 좋아요.",
    "팀 협업 기능이 추가되면 좋겠습니다.",
    "API 문서가 잘 정리되어 있어요.",
  ],
  hasMore: false,
};

const mockTag: ChoiceActionStats = {
  actionId: "action-4",
  title: "관심 분야 (복수 선택)",
  actionType: "TAG",
  totalResponses: 80,
  type: "choice",
  options: [
    { label: "IT/테크", count: 45, percentage: 56.3 },
    { label: "디자인", count: 30, percentage: 37.5 },
    { label: "마케팅", count: 22, percentage: 27.5 },
    { label: "교육", count: 18, percentage: 22.5 },
  ],
};

const mockRating: ScaleActionStats = {
  actionId: "action-5",
  title: "서비스 별점",
  actionType: "RATING",
  totalResponses: 50,
  type: "scale",
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
};

const mockShortText: TextActionStats = {
  actionId: "action-6",
  title: "닉네임을 입력해주세요",
  actionType: "SHORT_TEXT",
  totalResponses: 5,
  type: "text",
  samples: ["하늘바라기", "코딩왕", "디자인러버", "폴리아팬", "개발새발"],
  hasMore: false,
};

const mockImage: CountOnlyActionStats = {
  actionId: "action-7",
  title: "인증 사진 업로드",
  actionType: "IMAGE",
  totalResponses: 45,
  type: "count",
};

const mockDate: CountOnlyActionStats = {
  actionId: "action-8",
  title: "참여 가능 날짜",
  actionType: "DATE",
  totalResponses: 60,
  type: "count",
};

const allItems: ActionStatItem[] = [
  mockChoice,
  mockScale,
  mockText,
  mockTag,
  mockRating,
  mockShortText,
  mockImage,
  mockDate,
];

function ActionStatCard({ item }: { item: ActionStatItem }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-zinc-800">{item.title}</h4>
        <span className="text-xs text-zinc-400">{item.totalResponses}건</span>
      </div>
      {item.type === "choice" && <ChoiceBarChart data={item} />}
      {item.type === "scale" && <ScaleDistributionChart data={item} />}
      {item.type === "text" && <TextResponseList data={item} />}
      {item.type === "count" && <CountOnlyDisplay data={item} />}
    </div>
  );
}

function ActionStatsComposite({ items }: { items: ActionStatItem[] }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-900">액션별 통계</h3>
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600">
          {items.length}개 액션
        </span>
      </div>
      {items.map(item => (
        <ActionStatCard key={item.actionId} item={item} />
      ))}
    </div>
  );
}

const meta: Meta<typeof ActionStatsComposite> = {
  title: "Mission/ActionStats/Composite",
  component: ActionStatsComposite,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `# ActionStats Composite

액션별 통계 섹션의 전체 레이아웃을 보여주는 통합 스토리입니다.
실제 ActionStatsSection은 서버 데이터를 fetch하지만, 이 스토리는 모든 타입의 mock 데이터를 조합하여 렌더링합니다.

## 포함된 타입
- **choice**: 객관식(MULTIPLE_CHOICE), 태그(TAG), 분기(BRANCH)
- **scale**: 척도(SCALE), 별점(RATING)
- **text**: 주관식(SUBJECTIVE), 단답형(SHORT_TEXT)
- **count**: 이미지(IMAGE), 영상(VIDEO), PDF, 날짜(DATE), 시간(TIME)
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTypes: Story = {
  args: {
    items: allItems,
  },
  parameters: {
    docs: {
      description: {
        story: "모든 액션 타입이 포함된 전체 레이아웃입니다.",
      },
    },
  },
};

export const ChoiceOnly: Story = {
  args: {
    items: [mockChoice, mockTag],
  },
  parameters: {
    docs: {
      description: {
        story: "객관식/태그 타입만 있는 미션입니다.",
      },
    },
  },
};

export const ScaleOnly: Story = {
  args: {
    items: [mockScale, mockRating],
  },
  parameters: {
    docs: {
      description: {
        story: "척도/별점 타입만 있는 미션입니다.",
      },
    },
  },
};

export const TextOnly: Story = {
  args: {
    items: [mockText, mockShortText],
  },
  parameters: {
    docs: {
      description: {
        story: "주관식/단답형만 있는 미션입니다.",
      },
    },
  },
};

export const FileActionsOnly: Story = {
  args: {
    items: [mockImage, mockDate],
  },
  parameters: {
    docs: {
      description: {
        story: "파일/날짜 등 count 타입만 있는 미션입니다.",
      },
    },
  },
};

export const SingleAction: Story = {
  args: {
    items: [mockChoice],
  },
  parameters: {
    docs: {
      description: {
        story: "액션이 1개뿐인 미션입니다.",
      },
    },
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
  render: () => (
    <div className="mx-auto max-w-2xl bg-white p-5">
      <div className="px-5 py-10 text-center text-sm text-zinc-400">아직 액션이 없습니다.</div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "액션이 없는 빈 상태입니다.",
      },
    },
  },
};

export const AllZeroResponses: Story = {
  args: {
    items: [
      { ...mockChoice, totalResponses: 0, options: [] },
      { ...mockScale, totalResponses: 0, distribution: [], mean: 0, median: 0, min: 0, max: 0 },
      { ...mockText, totalResponses: 0, samples: [] },
      { ...mockImage, totalResponses: 0 },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "액션은 있지만 모든 응답이 0건인 경우입니다.",
      },
    },
  },
};
