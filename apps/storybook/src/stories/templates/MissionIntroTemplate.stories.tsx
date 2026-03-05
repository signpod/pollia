import { ProfileHeaderView } from "@/components/common/ProfileHeaderView";
import { MissionIntroTemplate } from "@/components/common/templates/MissionIntroTemplate";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof MissionIntroTemplate> = {
  title: "Templates/MissionIntroTemplate",
  component: MissionIntroTemplate,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `# MissionIntroTemplate

미션 인트로 화면의 상단 영역(이미지, 로고, 제목, 위젯, 스크롤 유도 버튼)을 담당하는 Template 컴포넌트입니다.

## 구성 요소

- 헤더 (ProfileHeaderView, 외부에서 주입)
- 미션 이미지 (imageUrl 있을 때만)
- 브랜드 로고, 제목, 마감일 텍스트
- 리워드/데드라인 위젯 (선택)
- 아래로 내려보세요 버튼
- children (컨텐츠 영역)

## Props

| Prop | Type | Description |
|------|------|-------------|
| header | ReactNode | 상단 헤더 (ProfileHeaderView 등) |
| imageUrl | string \\| null | 미션 이미지 URL (없으면 인트로 영역 미렌더링) |
| brandLogoUrl | string | 브랜드 로고 URL |
| title | string \\| null | 미션 제목 |
| formattedDeadline | string \\| null | 포맷된 마감일 텍스트 |
| isRequirePassword | boolean | 비밀번호 잠금 아이콘 표시 |
| showRewardWidget | boolean | 리워드 위젯 표시 |
| rewardName | string | 리워드명 |
| showDeadlineWidget | boolean | 데드라인 위젯 표시 |
| deadlineDate | Date \\| null | 데드라인 날짜 (위젯용) |
| onScrollDown | function | 스크롤 유도 버튼 클릭 핸들러 |
| children | ReactNode | 하단 컨텐츠 |
`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_IMAGE = "https://picsum.photos/800/600";
const SAMPLE_LOGO = "https://picsum.photos/64/64";
const SAMPLE_TITLE = "미션 제목입니다";
const SAMPLE_DEADLINE = "2025년 3월 31일";
const SAMPLE_REWARD_NAME = "참여 기념품";

const MOCK_USER = { name: "테스터" };
const MOCK_PROFILE_IMAGE = null;

function MockHeader({ showBack = false }: { showBack?: boolean }) {
  return (
    <ProfileHeaderView showBack={showBack} user={MOCK_USER} profileImageUrl={MOCK_PROFILE_IMAGE} />
  );
}

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7);

export const Default: Story = {
  render: () => (
    <MissionIntroTemplate
      header={<MockHeader />}
      imageUrl={SAMPLE_IMAGE}
      brandLogoUrl={SAMPLE_LOGO}
      title={SAMPLE_TITLE}
      formattedDeadline={SAMPLE_DEADLINE}
      isRequirePassword
      showRewardWidget
      rewardName={SAMPLE_REWARD_NAME}
      showDeadlineWidget
      deadlineDate={futureDate}
      onScrollDown={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
    >
      <div className="min-h-[50vh] bg-white px-5 py-10">children 영역 (컨텐츠)</div>
    </MissionIntroTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "모든 옵션이 켜진 풀 스펙. 이미지, 로고, 제목, 마감일, 리워드/데드라인 위젯, 비밀번호 아이콘, children 포함.",
      },
    },
  },
};

export const WithBackButton: Story = {
  render: () => (
    <MissionIntroTemplate
      header={<MockHeader showBack />}
      imageUrl={SAMPLE_IMAGE}
      brandLogoUrl={SAMPLE_LOGO}
      title={SAMPLE_TITLE}
      formattedDeadline={SAMPLE_DEADLINE}
      showRewardWidget
      rewardName={SAMPLE_REWARD_NAME}
      onScrollDown={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
    >
      <div className="min-h-[50vh] bg-white px-5 py-10">children 영역 (컨텐츠)</div>
    </MissionIntroTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story: "히스토리가 있는 경우 뒤로가기 버튼이 표시되는 헤더입니다.",
      },
    },
  },
};

export const WithoutImage: Story = {
  render: () => (
    <MissionIntroTemplate header={<MockHeader />} imageUrl={null}>
      <div className="min-h-[50vh] bg-white px-5 py-10">
        imageUrl이 null이면 인트로 UI는 렌더링되지 않고 children만 표시됩니다.
      </div>
    </MissionIntroTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "imageUrl이 null일 때의 경곗값. 전체 인트로 영역이 사라지고 children만 렌더링됩니다.",
      },
    },
  },
};

export const MinimalProps: Story = {
  render: () => (
    <MissionIntroTemplate
      header={<MockHeader />}
      imageUrl={SAMPLE_IMAGE}
      onScrollDown={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "이미지와 스크롤 버튼만 있는 최소 렌더링. 로고/제목/위젯/마감일 없음.",
      },
    },
  },
};

export const RewardWidgetOnly: Story = {
  render: () => (
    <MissionIntroTemplate
      header={<MockHeader />}
      imageUrl={SAMPLE_IMAGE}
      brandLogoUrl={SAMPLE_LOGO}
      title={SAMPLE_TITLE}
      showRewardWidget
      rewardName={SAMPLE_REWARD_NAME}
      onScrollDown={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "리워드 위젯만 표시하는 위젯 조합 경곗값. 데드라인 위젯은 없음.",
      },
    },
  },
};

export const DeadlineWidgetOnly: Story = {
  render: () => (
    <MissionIntroTemplate
      header={<MockHeader />}
      imageUrl={SAMPLE_IMAGE}
      title={SAMPLE_TITLE}
      formattedDeadline={SAMPLE_DEADLINE}
      showDeadlineWidget
      deadlineDate={null}
      onScrollDown={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "데드라인 위젯만 켜고 deadlineDate가 null인 경곗값. showDeadlineWidget && deadlineDate 조건으로 위젯은 표시되지 않음.",
      },
    },
  },
};

export const WithoutHeader: Story = {
  render: () => (
    <MissionIntroTemplate
      imageUrl={SAMPLE_IMAGE}
      title={SAMPLE_TITLE}
      onScrollDown={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
    >
      <div className="min-h-[50vh] bg-white px-5 py-10">헤더가 없는 Template입니다.</div>
    </MissionIntroTemplate>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "헤더가 없는 Template입니다. header prop을 전달하지 않으면 헤더가 표시되지 않습니다.",
      },
    },
  },
};
