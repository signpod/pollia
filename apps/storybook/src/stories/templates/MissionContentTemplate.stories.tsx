import { MissionContentTemplate } from "@/components/common/templates/MissionContentTemplate";
import { MissionType } from "@prisma/client";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof MissionContentTemplate> = {
  title: "Templates/MissionContentTemplate",
  component: MissionContentTemplate,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# MissionContentTemplate

미션 인트로 하단의 탭 기반 컨텐츠 영역(상세 안내, 참여 혜택, 공유)을 담당하는 Template 컴포넌트입니다.

## 구성 요소

- 스티키 헤더 (로고 + 제목, isSticky일 때)
- 탭 (상세 안내 / 참여 혜택, reward 있을 때만 2개)
- 상세 안내 (description 유효할 때)
- 참여 혜택 (reward 있을 때)
- 공유 섹션 (missionType !== EXPERIENCE_GROUP일 때)

## Props

| Prop | Type | Description |
|------|------|-------------|
| brandLogoUrl | string | 브랜드 로고 URL |
| title | string \| null | 미션 제목 |
| isSticky | boolean | 스티키 헤더 표시 여부 |
| activeTab | string | 활성 탭 ID |
| onChangeTab | function | 탭 변경 핸들러 |
| description | string \| null | 상세 안내 HTML |
| reward | object \| null | 리워드 정보 (있으면 탭 2개) |
| missionType | MissionType \| null | EXPERIENCE_GROUP이면 공유 섹션 숨김 |
| shareButtons | ReactNode | 공유 버튼 영역 |
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_LOGO = "https://picsum.photos/64/64";
const SAMPLE_TITLE = "미션 제목입니다";
const SAMPLE_DESCRIPTION = "<p>미션 상세 안내 내용입니다. <strong>포맷</strong>이 적용됩니다.</p>";
const SAMPLE_REWARD_IMAGE = "https://picsum.photos/200/200";
const SAMPLE_REWARD_NAME = "참여 기념품";

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 14);

const MOCK_SHARE_BUTTONS = (
  <div className="flex gap-2">
    <button type="button" className="rounded bg-zinc-200 px-4 py-2 text-sm">
      카카오 공유
    </button>
    <button type="button" className="rounded bg-zinc-200 px-4 py-2 text-sm">
      링크 복사
    </button>
  </div>
);

export const Default: Story = {
  render: () => (
    <MissionContentTemplate
      brandLogoUrl={SAMPLE_LOGO}
      title={SAMPLE_TITLE}
      isSticky={false}
      description={SAMPLE_DESCRIPTION}
      reward={{
        imageUrl: SAMPLE_REWARD_IMAGE,
        name: SAMPLE_REWARD_NAME,
        scheduledDate: futureDate,
      }}
      missionType={MissionType.GENERAL}
      shareButtons={MOCK_SHARE_BUTTONS}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "설명 + 리워드 + 일반 미션 타입. 탭 2개(상세 안내, 참여 혜택), 공유 섹션 표시.",
      },
    },
  },
};

export const WithoutReward: Story = {
  render: () => (
    <MissionContentTemplate
      brandLogoUrl={SAMPLE_LOGO}
      title={SAMPLE_TITLE}
      isSticky={false}
      description={SAMPLE_DESCRIPTION}
      reward={null}
      missionType={MissionType.GENERAL}
      shareButtons={MOCK_SHARE_BUTTONS}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "리워드가 없을 때의 경곗값. 탭 1개(상세 안내)만 표시되고 참여 혜택 섹션 없음.",
      },
    },
  },
};

export const ExperienceGroupType: Story = {
  render: () => (
    <MissionContentTemplate
      brandLogoUrl={SAMPLE_LOGO}
      title={SAMPLE_TITLE}
      isSticky
      description={SAMPLE_DESCRIPTION}
      reward={{
        imageUrl: SAMPLE_REWARD_IMAGE,
        name: SAMPLE_REWARD_NAME,
        scheduledDate: futureDate,
      }}
      missionType={MissionType.EXPERIENCE_GROUP}
      shareButtons={MOCK_SHARE_BUTTONS}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "EXPERIENCE_GROUP 타입 + isSticky true. 공유 섹션이 숨겨지고, 스티키 헤더(로고+제목)가 보이는 경곗값.",
      },
    },
  },
};

export const EmptyContent: Story = {
  render: () => (
    <MissionContentTemplate
      brandLogoUrl={SAMPLE_LOGO}
      title={SAMPLE_TITLE}
      isSticky={false}
      description={null}
      reward={null}
      missionType={MissionType.GENERAL}
      shareButtons={MOCK_SHARE_BUTTONS}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "설명 없음 + 리워드 없음. 상세 안내/참여 혜택 본문 없이 탭과 공유 섹션만 있는 최소 컨텐츠 경곗값.",
      },
    },
  },
};
